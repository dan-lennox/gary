const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const Azure = require('azure-storage');
const azureConfig = require('../../../src/config/azure');
const axios = require('axios');
const crypto = require('crypto');

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_TEST_APP_ID,
    clientSecret: process.env.FACEBOOK_TEST_APP_SECRET,
    callbackURL: '/api/ui/auth/facebook/callback'
    //profileFields: ['emails']
  },
  (accessToken, refreshToken, profile, done) => {

    const fb = axios.create({
      baseURL: 'https://graph.facebook.com',
    });

    console.log('GOT TO HERE --------', profile.id);

    // Basic graph API request example (Just retrieves a user's profile).
    // fb.get(`/${profile.id}`, {
    //   params: {
    //     'access_token': accessToken
    //   }
    // })
    //   .then(function (response) {
    //     // handle success
    //     console.log(response.data);
    //   })
    //   .catch(function (error) {
    //     // handle error
    //     console.log(error);
    //   })
    //   .then(function () {
    //     // always executed
    //     console.log('called');
    //   });

    //accessToken = 'EAAB370qAWrABABgobdChzzZBv6iiKi8EM3ENpmcEJae38m4EcmlsglxnEJK9D6935zZCIhXDzZAbckLcsqs2kkfHUFVqbpEElwkDWEtSwc0tQrx9T1VkypwNzMHUoZBUhLDGAeTVB0uJFY0A3D089wCoSFuoyB6N9TtJ3HvGybkOqxfTbLtw9aBAOooJkX3NoDpfTYPvnKAgyZCb1hgrrNhP7X6yy1NmYxwKxOFIbtgZDZD';
    //profile.id = 220541778733038;

    fb.get(`/${profile.id}/ids_for_pages`, {
      params: {
        'page': process.env.FACEBOOK_TEST_APP_ID,
        'access_token': accessToken,
        'appsecret_proof': crypto.createHmac('sha256', process.env.FACEBOOK_TEST_APP_SECRET).update(accessToken).digest('hex')
      }
    })
      .then(function (response) {
        // handle success
        console.log('response', response.data);
      })
      .catch(function (error) {
        // handle error
        console.log('error', error);
      })
      .then(function () {
        // always executed
        console.log('called');
      });



    // // Connect to the Azure TableStorage.
    // let tableService = Azure.createTableService();
    //
    // // Generate an Azure table query to search for Message Address table data for the given userId.
    // var query = new Azure.TableQuery()
    //   .top(100);
    //   //.where('RowKey eq ?', profile.id)
    //   //.and('PartitionKey eq ?', 'part1');
    //
    // // Execute the query.
    // // @todo: temporarily use prod db for debugging.
    // //tableService.queryEntities(azureConfig.addressesTableName, query, null, function (error, result, response) {
    // tableService.queryEntities('todobotAddresses', query, null, (error, result, response) => {
    //   if (error) {
    //     console.log(error);
    //     //res.status(500).send(error);
    //     return;
    //   }
    //
    //   if (result.entries.length === 0) {
    //     console.log('no entries');
    //     //res.status(404).send('Bot user not found.');
    //     //return;
    //   }
    //
    //   console.log('USER FOUND!!!', result.entries);
    // });
    //
    // console.log('ACCESS TOKEN', accessToken);
    // console.log('REFRESH TOKEN', refreshToken);
    // console.log('PROFILE', profile);
  }
));
