/***********************************
 * apps route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';
import User from '../server/lib/utils/user';
var router = express.Router();
const { check, validationResult } = require('express-validator/check');
import sanitizeBody from 'express-validator/filter';
import config from '../config/index';
var ManagementClient = require('auth0').ManagementClient;

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/applications', function (req, res, next) {
  var management = new ManagementClient({
    domain: config.auth0Domain,
    clientId: config.auth0ManagementClientID,
    clientSecret: config.auth0ManagementClientSecret,
    scope: 'read:clients read:client_keys'
    });
    management.getClient(
      {
        client_id: User.getApplicationId(req.user)
      }, function (err, client) {
        if(err || client==null)
          renderApplications(req,res);
        else
          renderApplications(req,res,client);
  });
});

/* GET form */
router.get('/auth/applications/form', function (req, res, next) {
  renderApplicationsForm(req,res);
});

/* POSTcreate application */
router.post('/auth/applications/create', function (req, res, next) {

  const errors = validationResult(req);
  var appName=req.body.appName;
  var appUrl=req.body.appUrl;
  var allowedCallbakUrl=req.body.allowedCallbakUrl;

  var management = new ManagementClient({
      domain: config.auth0Domain,
      clientId: config.auth0ManagementClientID,
      clientSecret: config.auth0ManagementClientSecret,
      scope: 'create:clients'
      });
      management.createClient(
        {
          name: appName,
          description: appUrl,
          logo_uri: "",
          callbacks: [
            allowedCallbakUrl
          ],
          grant_types: [
            "client_credentials"
          ],
          app_type: "non_interactive",
        }, function (err, client) {
          if(err)
            renderApplicationsForm(req,res,err);
          else{
            User.setApplicationId(req.user,client.client_id,function (profile){
              renderApplications(req,res,client);
            });  
          }
            
    });
});

/***********************************
 * rendering functions
 ************************************/

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderApplications(req,res,client){
  if(client!=null){
    res.render('applications', {
      layout: 'master',
      applications:'active',
      user:{id:User.getUserId(req.user)},
      application:{name:client.name,clientId:client.client_id,clientSecret:client.client_secret,url:client.description,callbacks:client.callbacks}
    });
  }
  else{
    res.render('applications', {
      layout: 'master',
      applications:'active',
      user:{id:User.getUserId(req.user)}
    });
  }
  
}

/**
 * render creation form
 * @param {req} request
 * @param {res} response
 */
function renderApplicationsForm(req,res,err){
  res.render('applications-form', {
    layout: 'master',
    applications:'active',
    errors:err,
    user:{id:User.getUserId(req.user)}
  });
}


module.exports = router;
