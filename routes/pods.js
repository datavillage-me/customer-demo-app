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
router.get('/pods', function (req, res, next) {
  if(req.session.podTypeId!=null)
    renderPodsSelected(req,res);
  else 
    renderPods(req,res);
});

/* GET select pod */
router.get('/auth/pods/select', function (req, res, next) {
  var podCreated=req.query.podCreated;
  if(req.session.podTypeId!=null)
    renderPodsSelected(req,res,podCreated);
  else 
    renderPodsSelect(req,res);
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
          req.session.podTypeId=podId;
          renderPodsSelected(req,res);
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
function renderPodsSelected(req,res,podCreated){
  var callback=req.session.callbacks[0];
  var isGoogleDrive=false;
  if(req.session.podTypeId=="9ef6b81a414b2432ec6e3d384c5a36cea8aa0c30d3dd2b67364126ed80856f9c20654f032eef87ad981187da8c23c1186eefe1503714835c2e952bbb3f22729c")
    isGoogleDrive=true;
  res.render('pods-selected', {
    layout: 'master',
    pods:'active',
    pod:{isGoogleDrive:isGoogleDrive,podCreated:podCreated},
    callback:callback,
    callbackError:callback+"/error",
    user:{id:User.getUserId(req.user)},
    rootDomainDemoApp:config.rootDomainDemoApp,
    rootDomainPassportApp:config.rootDomainPassportApp
  });
}

module.exports = router;
