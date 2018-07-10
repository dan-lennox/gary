const passport = require('passport');

module.exports = (app) => {

  // Send the user to google oauth.
  app.get(
    '/api/ui/auth/facebook',
    passport.authenticate('facebook', {})
  );

  // Handle the return authentication code.
  app.get(
    '/api/ui/auth/facebook/callback',
    // Middleware (could be any function).
    passport.authenticate('facebook'),
    // Route handler.
    (req, res) => {
      console.log('res', res);
      // Redirect after succesfull login.
      res.redirect('/test-logged-in');
    }
  );

  app.get('/api/ui/current_user', (req, res) => {
    res.send(req.user || 'Not logged in.');
  });
};