const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const Azure = require('azure-storage');
const azureConfig = require('../../../src/config/azure');
const axios = require('axios');
const crypto = require('crypto');


module.exports = bot => {

  /**
   * Tell passport to generate an authentication cookie using the ID of the Azure table storage
   * document for the user's browser.
   *
   * The 'user' argument here is coming straight from our 'done' callback below after
   * our Azure table query.
   */
  passport.serializeUser((user, done) => {
    // 'null' argument represents an error. If no error, pass null.
    // user.id is the mongo object id (not the Facebookid). Mongo references .id to User._id.oid
    done(null, user.RowKey._);

    // Obviously it's a terrible idea to use the FaceookId for generating identific.ation cookies, since
    // the id wouldn't work with local strategy, facebook or any other strategy.
  });


  /**
   * Tell passport to process authentication cookie's when a request arrives from the User's browser.
   *
   * @param id String
   *   The Azure tablestorage document id (RowKey) previously added to the user's cookies.
   */
  passport.deserializeUser((id, done) => {
    // Connect to the Azure TableStorage.
    let tableService = Azure.createTableService();

    // Generate an Azure table query to search for Message Address table data for the given userId.
    var query = new Azure.TableQuery()
      .where('RowKey eq ?', id)
      .and('PartitionKey eq ?', 'part1');

    // Execute the query.
    tableService.queryEntities(azureConfig.addressesTableName, query, null, (error, result, response) => {

      if (error) {
        console.log(error);
        done(error);
        return;
      }

      if (result.entries.length === 0) {
        done('Bot user not found.');
        return;
      }

      // Parse the Message Address.
      let messageAddress = JSON.parse(result.entries[0].messageAddress._);

      // Load the session for the User with the given Message Address.
      bot.loadSession(messageAddress, (error, result) => {
        if (error) {
          done('Bot message address not found.');
          return
        }

        done(null, result.userData);
      });
    });
  });


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
        .then(response => {

          // We found a Bot ID for the given user Oauth User id.
          let userBotId = response.data.data[0].id;

          // Generate an Azure table query to search for Message Address table data for the given User Bot Id.
          let query = new Azure.TableQuery()
            .where('RowKey eq ?', userBotId)
            .and('PartitionKey eq ?', 'part1');

          // Execute the query.
          tableService.queryEntities(azureConfig.addressesTableName, query, null, (error, result, response) => {
            if (error) {
              done(error);
              return;
            }

            if (result.entries.length === 0) {
              done('Bot user not found.');
              return;
            }

            console.log('USER FOUND!!!', result.entries[0]);
            done(null, result.entries[0]);
          });

        })
        .catch(error => {
          // handle error
          console.log('error', error);
        });
    }
  ));
};