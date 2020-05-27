/***********************************
 * cages route
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

/***********************************
 * Private functions
 ************************************/

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

/***********************************
 * routes functions
 ************************************/
/* GET dashboard home */
router.get('/auth/workbench', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderWorkbench(req,res,"import",consentReceiptsList);
  });
});

/* GET import */
router.get('/auth/workbench/import', function (req, res, next) {
  getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderWorkbench(req,res,"import",consentReceiptsList);
  });
  
});

/* POST try application access token end point */
router.post('/auth/workbench/import', function (req, res, next) {
  var consentReceiptSelected=req.body.consentReceiptSelected;
  var importStartDate=req.body.importStartDate;
  var importEndDate=req.body.importEndDate;

  //get application access token
  var options = {
    'method': 'Get',
    'url': 'https://api.datavillage.me/cages/'+consentReceiptSelected+'/importData?startDate='+importStartDate+'&endDate='+importEndDate,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+req.session.applicationUserAccessToken
    }
    };
    request(options, function (error, response) { 
      console.log(response);
      if(response !=null){
        renderHttpResponse(req,res,response.body,"importDataResponseiFrame","250");
      }
      else
        renderHttpResponse(req,res,"importDataResponseiFrame","10");
    });
});

/* GET graphql */
router.get('/auth/workbench/graphql', function (req, res, next) {
    renderWorkbench(req,res,"graphql");
});


/***********************************
 * rendering functions
 ************************************/

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderWorkbench(req,res,tab,consentReceiptsList){
  var importTab;
  var graphqlTab;
  switch(tab){
    case "graphql":
      graphqlTab='active';
    break;
    case "import":
      importTab='active';
    break;
    default:
      importTab='active';
    break;
  }
  res.render('workbench', {
    layout: 'master',
    cages:'active',
    graphql:graphqlTab,
    import:importTab,
    consentReceiptsList:consentReceiptsList
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

module.exports = router;
