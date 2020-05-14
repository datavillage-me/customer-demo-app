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

function getConsentReceiptByUri(req,consentReceiptUri,loadConsentReceiptsChain,cb){
  var options = {
    'method': 'GET',
    'url': consentReceiptUri+"?consentReceiptChain="+loadConsentReceiptsChain,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+req.session.applicationAccessToken
    }
    };
    request(options, function (error, response) { 
      cb(response);
    });

}

function getConsentReceipt(req,consentReceiptId,loadConsentReceiptsChain,cb){
  getConsentReceiptByUri(req,'https://api.datavillage.me/consentReceipts/'+consentReceiptId,loadConsentReceiptsChain,cb);
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
        try{
          var jsonBody=JSON.parse(response.body);
          cb(jsonBody);
        }
        catch(error){
          cb(null);
        }
      }
    });
  }
  else
    cb(null);

}

function getConsentsChain(req,consentReceiptId,cb){
  var options = {
    'method': 'GET',
    'url': 'https://api.datavillage.me/consents/'+consentReceiptId+"?consentChain=true",
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+req.session.applicationUserAccessToken
    }
    };
    request(options, function (error, response) { 
      if(response.statusCode!=200)
        cb(null);
      else
        cb(response.body);
    });
}

function getConsent(req,consentReceiptId,cb){
  var options = {
    'method': 'GET',
    'url': 'https://api.datavillage.me/consents/'+consentReceiptId,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+req.session.applicationUserAccessToken
    }
    };
    request(options, function (error, response) { 
      if(response.statusCode!=200)
        cb(null);
      else
        cb(response.body);
    });
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
    renderConsentsForm(req,res,consentReceiptsList,"creation");
  });
});

/* GET creation tab */
router.get('/auth/consents/form/creation', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderConsentsForm(req,res,consentReceiptsList,"creation");
  });
});

/* GET read tab */
router.get('/auth/consents/form/read', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderConsentsForm(req,res,consentReceiptsList,"read");
  });
});

/* GET activate tab */
router.get('/auth/consents/form/activate', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderConsentsForm(req,res,consentReceiptsList,"activate");
  });
});


/* POST create consentReceipt */
router.post('/auth/consents/create', function (req, res, next) {

  const errors = validationResult(req);
  var consentReceiptName=req.body.consentReceiptName;
  var consentReceiptDescription=req.body.consentReceiptDescription;
  var consentReceiptPurpose=req.body.consentReceiptPurpose;
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
  
  getConsentReceipt(req,consentReceiptSelected,false,function(consentReceipt){
    if(consentReceipt !=null)
      renderHttpResponse(req,res,consentReceipt.body,"consentReceiptResponseiFrame","500");
    else
      renderHttpResponse(req,res,"consentReceiptResponseiFrame","10");
  });
});

/* GET privacy center */
router.get('/auth/consents/privacyCenter', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderPrivacyCenter(req,res,consentReceiptsList,"creation");
  });
});

/* GET privacy center creation */
router.get('/auth/consents/privacyCenter/creation', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderPrivacyCenter(req,res,consentReceiptsList,"creation");
  });
});

/* GET privacy center link */
router.get('/auth/consents/privacyCenter/link', function (req, res, next) {
  getConsentReceiptForConsentList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderPrivacyCenter(req,res,consentReceiptsList,"link");
  });
});


/* POST generate privacy center widget */
router.post('/auth/consents/privacyCenter/get', function (req, res, next) {
  var consentReceiptSelected=req.body.consentReceiptSelected;

  getConsentReceipt(req,consentReceiptSelected,true,function(consentReceipt){
    if(consentReceipt !=null){
      //create HTML widget
      renderHttpResponse(req,res,consentReceipt.body,"consentReceiptResponseiFrame","500");
    }
    else
      renderHttpResponse(req,res,"consentReceiptResponseiFrame","10");
  });
});

function routePrivacyCenterWidget(req,res,consentReceiptSelected){
  getConsentReceipt(req,consentReceiptSelected,true,function(consentReceipt){
    if(consentReceipt !=null){
      //get consent receipt of the pod
      getConsentReceipt(req,req.session.podTypeId,false,function(consentReceiptPod){
        getConsentsChain(req,consentReceiptSelected,function(consents){
          getConsent(req,req.session.podTypeId,function(consentPod){
            renderPrivacyCenterWidget(req,res,consentReceiptSelected,consentReceipt.body,consentReceiptPod.body,consents,consentPod);
          });
        });
      });
    }
      else
    renderPrivacyCenterWidget(req,res,consentReceiptSelected);
  });

}

/* POST generate privacy center widget */
router.post('/auth/consents/privacyCenter/createWidget', function (req, res, next) {
  routePrivacyCenterWidget(req,res,req.body.consentReceiptSelected);
});

/* GET generate privacy center widget */
router.get('/auth/consents/privacyCenter/createWidgetCallback', function (req, res, next) {
  routePrivacyCenterWidget(req,res,req.query.consentReceiptSelected);
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
function renderConsentsForm(req,res,consentReceiptsList,tab){
  var creation;
  var read;
  var activate;
  switch(tab){
    case "creation":
      creation='active';
    break;
    case "read":
      read='active';
    break;
    case "activate":
    activate='active';
    break;
  }
  res.render('consents-form', {
    layout: 'master',
    consents:'active',
    consentReceiptsList:consentReceiptsList,
    user:{id:User.getUserId(req.user)},
    creation:creation,
    read:read,
    activate:activate
  });
}

/**
 * render http response home
 * @param {req} request
 * @param {res} response
 */
function renderHttpResponse(req,res,responseBody,iFrameId,iFrameHeight,widget){
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
    iFrameHeight:iFrameHeight,
    widget:widget
  });
}

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderPrivacyCenter(req,res,consentReceiptsList,tab){
  var creation;
  var link;
  switch(tab){
    case "creation":
      creation='active';
    break;
    case "link":
      link='link';
    break;
  }
  res.render('privacy-center', {
    layout: 'master',
    consents:'active',
    consentReceiptsList:consentReceiptsList,
    user:{id:User.getUserId(req.user)},
    creation:creation,
    link:link
  });
}

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderPrivacyCenterWidget(req,res,consentReceiptSelected,consentReceipt,consentReceiptPod,consentsChain,consentPod){
  var consentReceiptJson=JSON.parse(consentReceipt);
  var consentReceiptPodJson=JSON.parse(consentReceiptPod);
  
  var dataSources="{\"sources\":[";
  for(var i=0;i<consentReceiptJson.sources.length;i++){
    dataSources+="{\"name\":\""+consentReceiptJson.sources[i]["gl:name"]+"\",";
    dataSources+="\"description\":\""+consentReceiptJson.sources[i]["gl:description"]+"\",";
    var arrayId=consentReceiptJson.sources[i]["@id"].split("/");
    dataSources+="\"id\":\""+arrayId[arrayId.length-1]+"\"}";
    if(i!=consentReceiptJson.sources.length-1)
      dataSources+=",";
  }
  dataSources+="]}";
  

  var consents="{";

  if(consentPod){
    var consentPodJson=JSON.parse(consentPod);
    //pod consent
    var arrayId=consentPodJson["@id"].split("/");
    var consentStatus=consentPodJson["gl:hasStatus"]["@id"];
    var consentStatusBoolean=false;
    if(consentStatus=="https://w3id.org/GConsent#ConsentStatusExplicitlyGiven")
      consentStatusBoolean=true;
    consents+="\""+arrayId[arrayId.length-1]+"\":\""+consentStatusBoolean+"\",";
  }

  if(consentsChain){
    var consentsJson=JSON.parse(consentsChain);
    if(consentsJson.main){
      //main consent
      arrayId=consentsJson.main["@id"].split("/");
      var consentStatus=consentsJson.main["gl:hasStatus"]["@id"];
      var consentStatusBoolean=false;
      if(consentStatus=="https://w3id.org/GConsent#ConsentStatusExplicitlyGiven")
        consentStatusBoolean=true;
      consents+="\""+arrayId[arrayId.length-1]+"\":\""+consentStatusBoolean+"\",";
    }
    if(consentsJson.sources){
      //data sources consent
      for(i=0;i<consentsJson.sources.length;i++){
        arrayId=consentsJson.sources[i]["@id"].split("/");
        consentStatus=consentsJson.sources[i]["gl:hasStatus"]["@id"];
        consentStatusBoolean=false;
        if(consentStatus=="https://w3id.org/GConsent#ConsentStatusExplicitlyGiven")
          consentStatusBoolean=true;
        consents+="\""+arrayId[arrayId.length-1]+"\":\""+consentStatusBoolean+"\"";
        consents+=",";
      }
    }
  }
  if(consentPod || consentsChain)
    consents=consents.substr(0,consents.length-1);
  consents+="}";
console.log(consents);
  var rootDomainDemoApp=config.rootDomainDemoApp;
  var rootDomainPassportApp=config.rootDomainPassportApp;
  res.render('privacy-center-widget', {
    layout: 'singlePage',
    user:{id:User.getUserId(req.user)},
    consentReceipt:{id:consentReceiptSelected,name:consentReceiptJson.main["gl:name"],description:consentReceiptJson.main["gl:description"],purpose:consentReceiptJson.main["gl:forPurpose"]["gl:description"]},
    consentReceiptPod:{name:consentReceiptPodJson["gl:name"],description:consentReceiptPodJson["gl:description"],purpose:consentReceiptPodJson["gl:forPurpose"]["gl:description"]},
    dataSources:JSON.parse(dataSources),
    consents:JSON.parse(consents),
    action:rootDomainPassportApp+'/sources/activate',
    actionActivateConsent:rootDomainPassportApp+'/consents/activate',
    actionDesactivateConsent:rootDomainPassportApp+'/consents/desactivate',
    actionPod:rootDomainPassportApp+'/pods/activate',
    callback:rootDomainDemoApp+'/auth/consents/privacyCenter/createWidgetCallback?consentReceiptSelected='+consentReceiptSelected,
    callbackError:rootDomainDemoApp+'/auth/consents/privacyCenter/createWidgetCallback?consentReceiptSelected='+consentReceiptSelected,
  });
}

module.exports = router;
