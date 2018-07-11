const Azure = require('azure-storage');
const cookieSession = require('cookie-session');
const passport = require('passport');
const requireLogin = require('./middleware/requireLogin');

module.exports = (app, bot, azureConfig) => {

  app.use(
    cookieSession({
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 day cookie.
      keys: [process.env.COOKIE_KEY] // Cookie encryption
    })
  );

  require('./services/passport')(bot);

  // Tell passport to use cookies for authentication.
  app.use(passport.initialize());
  app.use(passport.session());

  require('./routes/authRoutes')(app);

  app.get('/api/ui/test', (req, res) => {
    res.send({hi: 'there'});
  });

  /**
   * Retrieve a list of "Conquered" countries.
   */
  app.get('/api/ui/countries', requireLogin, (req, res) => {
    res.send(req.user.countries || []);
  });
};