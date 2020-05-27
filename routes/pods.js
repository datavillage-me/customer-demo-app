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
import request from 'request';
var ManagementClient = require('auth0').ManagementClient;

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/pods', function (req, res, next) {
  if(req.session.podTypeId!=null)
    renderPodsSelected(req,res);
  else 
    renderPods(req,res);
});

/* GET select pod */
router.get('/auth/pods/select', function (req, res, next) {
  if(req.session.podTypeId!=null)
    renderPodsSelected(req,res);
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

/* GET application userCreation tab */
router.get('/auth/pods/userCreation', function (req, res, next) {
    renderPodsSelected(req,res,"userCreation");
});

/* GET application userToken tab */
router.get('/auth/pods/userToken', function (req, res, next) {
    renderPodsSelected(req,res,"userToken");
});



/* POST try user creation end point */
router.post('/auth/pods/test/users', function (req, res, next) {
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
              if(response !=null)
                renderHttpResponse(req,res,response.body,"userCreationResponseiFrame","300");
              else
                renderHttpResponse(req,res,"userCreationResponseiFrame","10");           
        });
      }
    });
});

/* POST try user creation end point */
router.post('/auth/pods/test/users/token', function (req, res, next) {
  var applicationAccessToken=req.body.applicationAccessToken;
  var applicationUserId=req.body.applicationUserId;
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
        if(response !=null){
          req.session.applicationUserAccessToken=JSON.parse(response.body).access_token;
          renderHttpResponse(req,res,response.body,"userTokenResponseiFrame","250");
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
function renderPodsSelected(req,res,tab){
  var userCreation;
  var userToken;
  switch(tab){
    case "userCreation":
      userCreation='active';
    break;
    case "userToken":
      userToken='active';
    break;
    default:
    userCreation='active';
    break;
  }
  var callback=req.session.callbacks[0];
  var isGoogleDrive=false;
  if(req.session.podTypeId=="9ef6b81a414b2432ec6e3d384c5a36cea8aa0c30d3dd2b67364126ed80856f9c20654f032eef87ad981187da8c23c1186eefe1503714835c2e952bbb3f22729c")
    isGoogleDrive=true;
  res.render('pods-selected', {
    layout: 'master',
    pods:'active',
    userCreation:userCreation,
    userToken:userToken,
    pod:{isGoogleDrive:isGoogleDrive},
    callback:callback,
    callbackError:callback+"/error",
    user:{id:User.getUserId(req.user)},
    rootDomainDemoApp:config.rootDomainDemoApp,
    rootDomainPassportApp:config.rootDomainPassportApp
  });
}


/**
 * render http response home
 * @param {req} request
 * @param {res} response
 */
function renderHttpResponse(req,res,responseBody,iFrameId,iFrameHeight){
  var responseToShow=responseBody;
  try{
    responseToShow=JSON.stringify(JSON.parse(responseBody),null,'\t');
  }
  catch(err){
    responseToShow=responseBody;
  }
  res.render('http-response', {
    layout: 'httpResponse',
    httpResponse:responseToShow,
    iFrameId:iFrameId,
    iFrameHeight:iFrameHeight
  });
}

module.exports = router;
