const Azure = require('azure-storage');

module.exports = (app, bot, azureConfig) => {

  app.get('/api/ui/test', (req, res) => {
    res.send({hi: 'there'});
  });

  app.get('/api/ui/countries', (req, res) => {
    // @todo: Add requireLogin middleware.
    res.send(['Australia', 'Canada', 'US']);
  });

};