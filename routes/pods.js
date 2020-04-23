/***********************************
 * pods route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';
import User from '../server/lib/utils/user';
var router = express.Router();
import config from '../config/index';
var ManagementClient = require('auth0').ManagementClient;

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/pods', function (req, res, next) {
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
        if(err || (client==null || client.client_metadata==null || client.client_metadata.podTypeId==null))
          renderPods(req,res);
        else{
          var podId=client.client_metadata.podTypeId;
          renderPodsSelected(req,res,podId,client.callbacks);
        }
  });
  
});

/* GET select pod */
router.get('/auth/pods/select', function (req, res, next) {
  var podCreated=req.query.podCreated;
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
        if(err || (client==null || client.client_metadata==null || client.client_metadata.podTypeId==null))
          renderPodsSelect(req,res);
        else{
          var podId=client.client_metadata.podTypeId;
          renderPodsSelected(req,res,podId,client.callbacks,podCreated);
        }
  });
  
});

/* GET select pod */
router.get('/auth/pods/form', function (req, res, next) {
  var podId=req.query.podId;

  var management = new ManagementClient({
    domain: config.auth0Domain,
    clientId: config.auth0ManagementClientID,
    clientSecret: config.auth0ManagementClientSecret,
    scope: 'update:clients'
    });
    management.updateClient(
      { client_id: User.getApplicationId(req.user)},
      {"client_metadata":{"podTypeId":podId}}, function (err, client) {
        console.log(err);
        if(err)
          renderPodsSelect(req,res);
        else{
          renderPodsSelected(req,res,podId,client.callbacks);
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
function renderPods(req,res){
  res.render('pods', {
    layout: 'master',
    pods:'active',
    user:{id:User.getUserId(req.user)}
  });
}

/**
 * render pods select
 * @param {req} request
 * @param {res} response
 */
function renderPodsSelect(req,res){
  res.render('pods-select', {
    layout: 'master',
    pods:'active',
    user:{id:User.getUserId(req.user)}
  });
}


/**
 * render pod selected 
 * @param {req} request
 * @param {res} response
 */
function renderPodsSelected(req,res,podId,callbacks,podCreated){
  var callback=callbacks[0];
  var isGoogleDrive=false;
  if(podId=="9ef6b81a414b2432ec6e3d384c5a36cea8aa0c30d3dd2b67364126ed80856f9c20654f032eef87ad981187da8c23c1186eefe1503714835c2e952bbb3f22729c")
    isGoogleDrive=true;
  res.render('pods-selected', {
    layout: 'master',
    pods:'active',
    pod:{podId:podId,isGoogleDrive:isGoogleDrive},
    callback:callback,
    callbackError:callback+"/error",
    user:{id:User.getUserId(req.user)},
    applicationUser:{token:req.session.applicationUserAccessToken,id:req.session.applicationUserId},
    rootDomainDemoApp:config.rootDomainDemoApp,
    rootDomainPassportApp:config.rootDomainPassportApp,
    podCreated:podCreated
  });
}

module.exports = router;
