module.exports = (app) => {

  app.get('/api/ui/test', (req, res) => {
    res.send({hi: 'there'});
  });

  app.get('/api/ui/countries', (req, res) => {
    // @todo: Add requireLogin middleware.
    res.send(['Australia', 'Canada', 'US']);
  });

};