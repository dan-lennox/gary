const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const Azure = require('azure-storage');
const azureConfig = require('../../../src/config/azure');
const axios = require('axios');
const crypto = require('crypto');

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/ui/auth/facebook/callback'
    //profileFields: ['emails']
  },
  (accessToken, refreshToken, profile, done) => {

    // Connect to the Azure TableStorage.
    let tableService = Azure.createTableService();

    const fb = axios.create({
      baseURL: 'https://graph.facebook.com',
    });

    // Each user has a unique id per facebook app.
    // The ID stored in our Azure table is the BOT user id.
    // Given the user's Oauth app (The facebook page) specific id,
    // we use the the Facebook Graph API id-matching endpoints to determine if the
    // BOT user and the PAGE user are the same facebook user id.
    fb.get(`/${profile.id}/ids_for_pages`, {
      params: {
        'app': process.env.FACEBOOK_APP_ID,
        'access_token': accessToken,
        'appsecret_proof': crypto.createHmac('sha256', process.env.FACEBOOK_APP_SECRET).update(accessToken).digest('hex')
      }
    })
      .then(function (response) {
        // handle success

        // @todo: lots more error checking here!

        // We found a Bot ID for the given user Oauth User id.
        let userBotId = response.data.data[0].id;

        // Generate an Azure table query to search for Message Address table data for the given User Bot Id.
        let query = new Azure.TableQuery()
          .where('RowKey eq ?', userBotId)
          .and('PartitionKey eq ?', 'part1');

        // Execute the query.
        // @todo: temporarily use prod db for debugging.
        //tableService.queryEntities(azureConfig.addressesTableName, query, null, function (error, result, response) {
        tableService.queryEntities('todobotAddresses', query, null, (error, result, response) => {
          if (error) {
            console.log(error);
            //res.status(500).send(error);
            return;
          }

          if (result.entries.length === 0) {
            console.log('no entries');
            //res.status(404).send('Bot user not found.');
            //return;
          }

          console.log('USER FOUND!!!', result.entries);
        });

      })
      .catch(function (error) {
        // handle error
        console.log('error', error);
      });
  }
));
