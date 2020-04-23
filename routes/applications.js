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
import request from 'request';
var ManagementClient = require('auth0').ManagementClient;

/***********************************
 * Private functions
 ************************************/
function getClient(req,cb){
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
        if(client!=null && client.client_metadata!=null)
          req.session.applicationUserId=client.client_metadata.applicationUserId;
        cb(client) ;
  });
}

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/applications', function (req, res, next) {
  getClient(req,function(client){
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
  var companyUri=req.body.companyUri;
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
          client_metadata:{"company_uri":companyUri},
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
    'url': 'https://api.datavillage.me/oauth/token',
    'headers': {
        'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded']
    },
    form: {
        'client_id': clientId,
        'client_secret': clientSecret
    }
    };
    request(options, function (error, response) { 
      if(response !=null)
        req.session.applicationAccessToken=JSON.parse(response.body).access_token;
        var applicationAccessTokenResponse=JSON.stringify(JSON.parse(response.body),null,'\t');
        getClient(req,function(client){
          renderApplications(req,res,client,applicationAccessTokenResponse);
        });
    });
});

/* POST try user creation end point */
router.post('/auth/applications/test/users', function (req, res, next) {
  var applicationAccessToken=req.body.applicationAccessToken;
  //create user
  var options = {
    'method': 'POST',
    'url': 'https://api.datavillage.me/users/',
    'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+applicationAccessToken
    }
    };
    request(options, function (error, response) { 
      if(response !=null){
        var jsonBody=JSON.parse(response.body);
        var userUri=jsonBody["@id"];
        var arr=userUri.split("/");
        var userId=arr[arr.length-1];
        req.session.applicationUserId=userId;
        //store user into client metadata
        var management = new ManagementClient({
          domain: config.auth0Domain,
          clientId: config.auth0ManagementClientID,
          clientSecret: config.auth0ManagementClientSecret,
          scope: 'update:clients'
          });
          management.updateClient(
            { client_id: User.getApplicationId(req.user)},
            {"client_metadata":{"applicationUserId":userId}}, function (err, client) {
              console.log(err);
              var applicationUser=JSON.stringify(jsonBody,null,'\t');
              console.log(applicationUser);
                getClient(req,function(client){
                  renderApplications(req,res,client,null,applicationUser);
                });              
        });
      }
    });
});

/* POST try user creation end point */
router.post('/auth/applications/test/users/token', function (req, res, next) {
  var applicationAccessToken=req.body.applicationAccessToken;
  var applicationUserId=req.body.applicationUserId;
  console.log(applicationUserId);
  //create user
  var options = {
    'method': 'GET',
    'url': 'https://api.datavillage.me/users/'+applicationUserId+'/token',
    'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+applicationAccessToken
    }
    };
    request(options, function (error, response) { 
      if(response !=null)
        req.session.applicationUserAccessToken=JSON.parse(response.body).access_token;
        var applicationUserAccessTokenResponse=JSON.stringify(JSON.parse(response.body),null,'\t');
        getClient(req,function(client){
          renderApplications(req,res,client,null,null,applicationUserAccessTokenResponse);
        });
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
function renderApplications(req,res,client,applicationAccessTokenResponse,applicationUserResponse,applicationUserAccessTokenResponse){
  if(client!=null){
    res.render('applications', {
      layout: 'master',
      applications:'active',
      user:{id:User.getUserId(req.user)},
      application:{name:client.name,clientId:client.client_id,clientSecret:client.client_secret,url:client.description,callbacks:client.callbacks,applicationAccessToken:req.session.applicationAccessToken,applicationAccessTokenResponse:applicationAccessTokenResponse},
      applicationUser:{id:req.session.applicationUserId,applicationUserResponse:applicationUserResponse,applicationUserAccessTokenResponse:applicationUserAccessTokenResponse}
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
