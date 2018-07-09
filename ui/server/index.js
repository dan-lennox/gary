const Azure = require('azure-storage');
require('./services/passport');

module.exports = (app, bot, azureConfig) => {

  require('./routes/authRoutes')(app);

  app.get('/api/ui/test', (req, res) => {
    res.send({hi: 'there'});
  });

  /**
   * Retrieve a list of "Conquered" countries.
   */
  app.get('/api/ui/countries', (req, res) => {
    // @todo: Add requireLogin middleware.
    // @todo: I need to implement OAuth integration first, then hook that up to a
    // @todo: requireLogin middleware.

    // Take a hardcorded user id.
    let userId = 'default-user';

    // Connect to the Azure TableStorage.
    let tableService = Azure.createTableService();

    // Generate an Azure table query to search for Message Address table data for the given userId.
    var query = new Azure.TableQuery()
      .where('RowKey eq ?', userId)
      .and('PartitionKey eq ?', 'part1');

    // Execute the query.
    tableService.queryEntities(azureConfig.addressesTableName, query, null, function(error, result, response) {
      if (error) {
        console.log(error);
        res.status(500).send(error)
        return;
      }

      if (result.entries.length === 0) {
        res.status(404).send('Bot user not found.');
        return;
      }

      // Parse the Message Address.
      let messageAddress = JSON.parse(result.entries[0].messageAddress._);

      // Load the session for the User with the given Message Address.
      bot.loadSession(messageAddress, (error, { userData }) => {
        if (error) {
          res.status(404).send('Bot message address not found.');
          return;
        }

        console.log('countries', userData.countries);

        // Return the list of Countries stored on the user's userData object.
        res.send(userData.countries || []);
      });

      // Debug with test data.
      // let countries = [ { Code: 'BG', Name: 'Bulgaria' }, { Code: 'MD', Name: 'Moldova, Republic of' } ];
      // res.send(countries);
    });
  });
};