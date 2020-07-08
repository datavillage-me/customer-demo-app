/***********************************
 * auth0 route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';
import config from '../config/index';
var url = require('url');
var util = require('util');
var querystring = require('querystring');
var router = express.Router();
import passport from 'passport';

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

// Perform the login, after login Auth0 will redirect to callback
router.get('/login', passport.authenticate('datavillage', {
  scope: 'openid email'
}), function (req, res) {
  res.redirect('/');
});


// Perform the final stage of authentication and redirect to previously requested URL or '/auth/dashboard'
router.get('/callback', function (req, res, next) {
  passport.authenticate('datavillage', function (err, user, info) {
    if (info=="unauthorized") {  return res.redirect('/error?unauthorized'); }
    if (err) {  return next(err); }
    if (!user) { return res.redirect('/error?nouser'); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || '/auth/applications');
    });
  })(req, res, next);
});


// Perform session logout and redirect to homepage
router.get('/auth/logout', (req, res) => {
  req.logout();
  var returnTo = config.auth0LogoutCallbackURL;
  var logoutURL = new url.URL(
    util.format('https://%s/v2/logout', config.auth0Domain)
  );
  var searchString = querystring.stringify({
    client_id: config.auth0ClientID,
    returnTo: returnTo
  });
  logoutURL.search = searchString;
  req.session.applicationUser=null;
  req.session.clientId=null;
  req.session.clientSecret=null;
  req.session.callbacks=null;
  req.session.companyUri=null;
  req.session.companyName=null;
  res.redirect(logoutURL);
});

/***********************************
 * Module exports.
 ************************************/
module.exports = router;
