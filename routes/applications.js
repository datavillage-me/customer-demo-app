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
import Consent from '../server/lib/utils/consent';
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
    req.session.clientName=client.name;
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
  else{
    req.session.clientId=null;
    req.session.clientName=null;
    req.session.clientSecret=null;
    req.session.clientMetadata=null;
    req.session.callbacks=null;
    req.session.companyUri=null;
    req.session.companyName=null;
    return done();
  }
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

/* POST create application */
router.post('/auth/applications/create', function (req, res, next) {
  const errors = validationResult(req);
  var appName=req.body.appName;
  var appUrl=req.body.appUrl;
  var allowedCallbakUrl=req.body.allowedCallbakUrl;
  Authentication.createClient(appName,appUrl,allowedCallback, function (client,err){  
    if(client==null)
      renderApplicationsForm(req,res,err);
    else{
      //update grant to enable accesstoken creation by created application
      var clientId=client.client_id;
      User.setApplicationId(req.user,clientId,function (profile){
        Authentication.getClient(User.getApplicationId(req.user),null,function(client){
          initClientSession(req,client,function(){
            renderApplications(req,res,client);
          });                      
        });
      });  
    }  
  });
});


/* POST delete application */
router.post('/auth/applications/delete', function (req, res, next) {
  var appName=req.body.appName;
  if(req.session.clientName==appName){
      //delete consent receipts
      Consent.deleteAllConsentReceipts(req.session.applicationAccessToken,function(response){
          //delete client
          Authentication.deleteClient(req.session.clientId,req.session.clientSecret,function(response){
            initClientSession(req,null,function(){
              renderApplications(req,res);
            });
        });
    });
  }
  else{
    Authentication.getClient(User.getApplicationId(req.user),null,function(client){
      initClientSession(req,client,function(){
        renderApplications(req,res,client,"App name does not exist!");
      });
    });
  }
});

/***********************************
 * rendering functions
 ************************************/

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderApplications(req,res,client,error){
  if(client!=null){
    res.render('applications', {
      layout: 'master',
      applications:'active',
      user:{id:User.getUserId(req.user)},
      application:{name:client.name,clientId:client.id,clientSecret:client.secret,url:client.description,callbacks:client.callbacks},
      error:error
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
