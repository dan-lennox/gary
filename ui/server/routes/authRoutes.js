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

  // Handle logout request.
  app.get('/api/ui/user/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/api/ui/user', (req, res) => {
    res.send(req.user || 'Not logged in.');
  });
};