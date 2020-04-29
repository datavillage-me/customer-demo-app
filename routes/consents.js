/***********************************
 * consents route
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

function getConsentReceiptsList(applicationAccessToken,cb){
  if(applicationAccessToken!=null){
    var options = {
      'method': 'GET',
      'url': 'https://api.datavillage.me/consentReceipts/',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+applicationAccessToken
      }
    };
    request(options, function (error, response) { 
      if(response !=null){
        var jsonBody=JSON.parse(response.body);
        cb(jsonBody);
      }
    });
  }
  else
    cb(null);

}

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/consents', function (req, res, next) {
  renderConsents(req,res);
});

/* GET form */
router.get('/auth/consents/form', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    getClient(req,function(client){
      renderConsentsForm(req,res,client,consentReceiptsList,"creation");
    });
  });
});

/* GET creation tab */
router.get('/auth/consents/form/creation', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    getClient(req,function(client){
      renderConsentsForm(req,res,client,consentReceiptsList,"creation");
    });
  });
});

/* GET read tab */
router.get('/auth/consents/form/read', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    getClient(req,function(client){
      renderConsentsForm(req,res,client,consentReceiptsList,"read");
    });
  });
});


/* POST create consentReceipt */
router.post('/auth/consents/create', function (req, res, next) {

  const errors = validationResult(req);
  var consentReceiptName=req.body.consentReceiptName;
  var consentReceiptDescription=req.body.consentReceiptDescription;
  var consentReceiptPurpose=req.body.consentReceiptPurpose;
  var consentReceiptDuration=req.body.consentReceiptDuration;
  var consentReceiptBehaviorExtractedFrequency=req.body.consentReceiptBehaviorExtractedFrequency;
  var consentReceiptCreatorName=req.body.consentReceiptCreatorName;
  var consentReceiptCreatorUri=req.body.consentReceiptCreatorUrl;
  var consentReceiptCreatorLogo=req.body.consentReceiptCreatorLogo;
  var consentReceiptDataSourcesValue=req.body.consentReceiptDataSourcesValue;
  var consentReceiptDataCategoriesValue=req.body.consentReceiptDataCategoriesValue;
  
  var applicationAccessToken=req.session.applicationAccessToken;

  //create user
  var options = {
    'method': 'POST',
    'url': 'https://api.datavillage.me/consentReceipts/',
    'headers': {
      'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded'],
      'Authorization': 'Bearer '+applicationAccessToken
    },
    form: {
      'name': consentReceiptName,
      'description': consentReceiptDescription,
      'purpose': consentReceiptPurpose,
      'duration': consentReceiptDuration,
      'data-categories': consentReceiptDataCategoriesValue,
      'data-sources': consentReceiptDataSourcesValue,
      'creator-name': consentReceiptCreatorName,
      'creator-uri': consentReceiptCreatorUri,
      'creator-logo': consentReceiptCreatorLogo,
      'behavior-extracted-frequency': consentReceiptBehaviorExtractedFrequency
    }
    };
    request(options, function (error, response) { 
      if(response !=null)
        renderHttpResponse(req,res,response.body,"consentReceiptCreationiFrame","300");
      else
        renderHttpResponse(req,res,"consentReceiptCreationiFrame","10");
    });

});


/* Get  consentReceipt */
router.post('/auth/consents/get', function (req, res, next) {

  const errors = validationResult(req);
  var consentReceiptSelected=req.body.consentReceiptSelected;
  var applicationAccessToken=req.session.applicationAccessToken;

  //create user
  var options = {
    'method': 'GET',
    'url': 'https://api.datavillage.me/consentReceipts/'+consentReceiptSelected,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+applicationAccessToken
    }
    };
    request(options, function (error, response) { 
      if(response !=null)
        renderHttpResponse(req,res,response.body,"consentReceiptResponseiFrame","500");
      else
        renderHttpResponse(req,res,"consentReceiptResponseiFrame","10");
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
function renderConsents(req,res){
  res.render('consents', {
    layout: 'master',
    consents:'active',
    user:{id:User.getUserId(req.user)}
  });
}

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderConsentsForm(req,res,client,consentReceiptsList,tab){
  var companyUri="";
  var companyName="";
  var creation;
  var read;
  switch(tab){
    case "creation":
      creation='active';
    break;
    case "read":
      read='active';
    break;
  }
  if(client!=null){
    companyUri=client.description;
    companyName=client.name;
  }
  res.render('consents-form', {
    layout: 'master',
    consents:'active',
    company:{name:companyName,uri:companyUri},
    application:{applicationAccessToken:req.session.applicationAccessToken},
    consentReceiptsList:consentReceiptsList,
    user:{id:User.getUserId(req.user)},
    creation:creation,
    read:read
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
