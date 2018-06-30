module.exports = (app) => {

  app.get('/api/ui/test', (req, res) => {
    res.send({hi: 'there'});
  });

};