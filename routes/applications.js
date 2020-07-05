/***********************************
 * apps route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';
import User from '../server/lib/utils/user';
import Authentication from '../server/lib/utils/authentication';
var router = express.Router();
const { check, validationResult } = require('express-validator/check');
import sanitizeBody from 'express-validator/filter';
import config from '../config/index';
import request from 'request';
var ManagementClient = require('auth0').ManagementClient;

/***********************************
 * Private functions
 ************************************/

function initClientSession(req,client,done){
  if(client!=null){ 
    req.session.clientId=client.id;
    req.session.clientSecret=client.secret;
    req.session.clientMetadata=client.metaData;
    req.session.callbacks=client.callbacks;
    req.session.companyUri=client.description;
    req.session.companyName=client.name;
    Authentication.getApplicationToken(client.id,client.secret,function (accessToken){
      req.session.applicationAccessToken=accessToken;
      return done();
    });
  }
  else
    return done();
}

/***********************************
 * routes functions
 ************************************/

/* GET application home */
router.get('/auth/applications', function (req, res, next) {
  Authentication.getClient(User.getApplicationId(req.user),null,function(client){
    initClientSession(req,client,function(){
      renderApplications(req,res,client);
    });
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
      scope: 'create:clients create:client_grants'
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
            //update grant to enable accesstoken creation by created application
            var clientId=client.client_id;
            management.createClientGrant(
              {
                client_id: clientId,
                audience: "https://datavillage.eu.auth0.com/api/v2/",
                scope: ["read:clients"]
              }, function (err, grant) {
                if(err)
                  renderApplicationsForm(req,res,err);
                else{
                  User.setApplicationId(req.user,clientId,function (profile){
                    req.session.callbacks=client.callbacks;
                    req.session.companyUri=appName;
                    req.session.companyName=appUrl;
                    renderApplications(req,res,client);
                  });  
                }
                  
          });
          }  
    });
});

/* POST try application access token end point */
router.post('/auth/applications/test/oauth/token', function (req, res, next) {
  var clientId=req.body.clientId;
  var clientSecret=req.body.clientSecret;

  //get application access token
  var options = {
    'method': 'POST',
    'url': 'https://'+config.getApiDomain()+'/oauth/token',
    'headers': {
        'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded']
    },
    form: {
        'client_id': clientId,
        'client_secret': clientSecret
    }
    };
    request(options, function (error, response) { 
      if(response !=null){
        req.session.applicationAccessToken=JSON.parse(response.body).access_token;
        renderHttpResponse(req,res,response.body,"applicationAccessTokenResponseiFrame","250");
      }
      else
        renderHttpResponse(req,res,"applicationAccessTokenResponseiFrame","10");
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
      application:{name:client.name,clientId:client.id,clientSecret:client.secret,url:client.description,callbacks:client.callbacks},
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
