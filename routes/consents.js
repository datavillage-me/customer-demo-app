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
import Consent from '../server/lib/utils/consent';

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/consents', function (req, res, next) {
  Consent.getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderConsents(req,res,consentReceiptsList);
  });
});

/* GET form */
router.get('/auth/consents/form', function (req, res, next) {
    renderConsentsForm(req,res);
});


/* POST create consentReceipt */
router.post('/auth/consents/create', function (req, res, next) {
  const errors = validationResult(req);
  var consentReceipt={};
  
  consentReceipt.name=req.body.consentReceiptName;
  consentReceipt.description=req.body.consentReceiptDescription;
  consentReceipt.purpose=req.body.consentReceiptPurpose;
  consentReceipt.behaviorExtractedFrequency=req.body.consentReceiptBehaviorExtractedFrequency;
  consentReceipt.creatorName=req.body.consentReceiptCreatorName;
  consentReceipt.creatorUri=req.body.consentReceiptCreatorUrl;
  consentReceipt.creatorLogo=req.body.consentReceiptCreatorLogo;
  consentReceipt.dataSourcesValue=req.body.consentReceiptDataSourcesValue;
  consentReceipt.dataCategoriesValue=req.body.consentReceiptDataCategoriesValue;

  Consent.createConsentReceipt(req.session.applicationAccessToken,consentReceipt,function (){
    Consent.getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
      renderConsents(req,res,consentReceiptsList);
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
function renderConsents(req,res,consentReceiptsList){
  var hasConsentReceipts=false;
  if(consentReceiptsList!=null && consentReceiptsList.consentReceipts.length>0)
  hasConsentReceipts=true;  
  res.render('consents', {
    layout: 'master',
    consents:'active',
    consentReceiptsList:consentReceiptsList,
    hasConsentReceipts:hasConsentReceipts
  });
}

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderConsentsForm(req,res,consentReceiptsList,tab){
  res.render('consents-form', {
    layout: 'master',
    consents:'active'
  });
}



module.exports = router;
