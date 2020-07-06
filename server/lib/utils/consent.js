/***********************************************************
 * User consents
 ***********************************************************/

/***********************************
 * Module dependencies.
 * @private
 ************************************/
import request from 'request';
import config from '../../../config/index';

/***********************************
 * Private constants.
 ************************************/

/***********************************
 * Private properties
 ************************************/

/***********************************
 * Private functions
 ************************************/
/**
 * get consentReceipt id
 *
 * @param {Object} consentReceiptUri request
 * @private
 */
function _getConsentReceiptId (consentReceiptUri) {
    var consentReceiptUriSplit=consentReceiptUri.split("/");
    return consentReceiptUriSplit[consentReceiptUriSplit.length-1];
}

 /**
 * create user consent 
 *
 * @param {Object} jwtToken user by auth0
 * @param {String} consentReceipt
 * @param {String} token if any
 * @private
 */
function _createUserConsent (userAccessToken,consentReceiptId,token,duration,cb) {
    var options = {
        'method': 'POST',
        'url': 'https://'+config.getApiDomain()+'/consents/'+consentReceiptId,
        'headers': {
          'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded'],
          'Authorization': 'bearer ' + userAccessToken
        },
        form: {
          'source-token': token,
          'duration':duration
        }
      };
    request.post(options, function(error, response, body){
        if (error) { 
            return console.log(error); 
        }
        return cb(body);
      });
}

/**
 * get user consents
 *
 * @param {string} applicationAccessToken 
 * @param {string} userId
 * @param {function} done  
 */
function _getUserConsents (applicationAccessToken,userId,done) {
   
}

/**
 * get consent chain
 *
 * @param {string} applicationAccessToken 
 * @param {string} consentRecieptId
 * @param {string} userId
* @param {string} clientId
 * @param {function} done 
 */
function _getConsentsChain(applicationAccessToken,consentReceiptId,userId,clientId,done){
  var url='https://'+config.getApiDomain()+'/consents/'+consentReceiptId+'/'+userId+'?consentChain=true';
  if(clientId!=null)
    url+='&clientId='+clientId;
  var options = {
    'method': 'GET',
    'url': url,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+applicationAccessToken
    }
    };
    request(options, function (error, response) { 
      if (error) { 
        console.log(err); 
        done (null);
      }
      if(response.body!=null && response.statusCode==200)
        done(JSON.parse(response.body));
      else
        done (null);
    });
  }

/**
 * get consent receipt
 *
 * @param {string} applicationAccessToken 
 * @param {string} consentReceiptId
 * @param {Boolean} consentReceiptChain
 * @param {string} clientId (optional)
 * @param {function} done 
 */
function _getConsentReceipt (applicationAccessToken,consentReceiptId,consentReceiptChain,clientId,done) {
    var url='https://'+config.getApiDomain()+'/consentReceipts/'+consentReceiptId;
    url+='?consentReceiptChain='+consentReceiptChain;
    if(clientId!=null)
      url+='&clientId='+clientId;
    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': 'bearer ' + applicationAccessToken
        }
      };
    request.get(options, function(err, response, body){
      if (err) { 
        console.log(err); 
        done (null);
      }
      if(body!=null){
        try{
          done(JSON.parse(body));
        }
        catch(error){
          console.log(error);
          done (null);
        }
      }
      else
        done (null);
      });
}

/**
 * get consent receipt list
 *
 * @param {string} applicationAccessToken 
 * @param {function} done 
 */
function _getConsentReceiptsList(applicationAccessToken,done){
  if(applicationAccessToken!=null){
    var options = {
      'method': 'GET',
      'url': 'https://'+config.getApiDomain()+'/consentReceipts/',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+applicationAccessToken
      }
    };
    request(options, function (error, response) { 
      if(response !=null){
        try{
          var jsonBody=JSON.parse(response.body);
          done(jsonBody);
        }
        catch(error){
          done(null);
        }
      }
    });
  }
  else
    done(null);
}

/**
 * create consent receipt list
 *
 * @param {string} applicationAccessToken 
 * @param {string} applicationAccessToken 
 * @param {function} done 
 */
function _createConsentReceipt(applicationAccessToken,consentReceipt,done){
  var options = {
      'method': 'POST',
      'url': 'https://'+config.getApiDomain()+'/consentReceipts/',
      'headers': {
        'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded'],
        'Authorization': 'Bearer '+applicationAccessToken
      },
      form: {
        'name': consentReceipt.name,
        'description': consentReceipt.description,
        'forPurpose': consentReceipt.forPurpose,
        'forProcessing': consentReceipt.forProcessing,
        'forPersonalData': consentReceipt.forPersonalDataSensitivity,
        'forPersonalDataCategory': consentReceipt.forPersonalDataCategory,
        'dataSources': consentReceipt.dataSources,
        'creator-name': consentReceipt.creatorName,
        'creator-uri': consentReceipt.creatorUri,
        'creator-logo': consentReceipt.creatorLogo
      }
    };
    request(options, function (error, response) { 
      if(response!=null){
        try{
          var jsonBody=JSON.parse(response.body);
          done(jsonBody);
        }
        catch(error){
          done(null);
        }
      }
    });
}

/***********************************
 * Module exports.
 ************************************/
var self=module.exports={
    setScope:function(scope,req){
      req.session.scope=scope;
    },
    getScope:function(req){
        return req.session.scope;
    },
    getConsentReceiptId:function(consentReceiptId){
      return _getConsentReceiptId(consentReceiptId);
    },  
    createUserConsent:function(jwtToken,consentReceiptId,token,duration,cb){
        _createUserConsent(jwtToken,consentReceiptId,token,duration,cb);
    },
    getUserConsents:function(applicationAccessToken,userId,done){
        _getUserConsents(applicationAccessToken,userId,done);
    },
    getConsentReceipt:function(applicationAccessToken,consentReceiptId,clientId,done){
        _getConsentReceipt(applicationAccessToken,consentReceiptId,false,clientId,done);
    },
    getConsentReceiptsList:function(applicationAccessToken,done){
      _getConsentReceiptsList(applicationAccessToken,done);
    },
    createConsentReceipt:function(applicationAccessToken,consentReceipt,done){
      _createConsentReceipt(applicationAccessToken,consentReceipt,done);
    },
    getConsentReceiptChain:function(applicationAccessToken,consentReceiptId,clientId,done){
      _getConsentReceipt(applicationAccessToken,consentReceiptId,true,clientId,done);
    },
    getConsentsChain:function(applicationAccessToken,consentReceiptId,userId,clientId,done){
      _getConsentsChain(applicationAccessToken,consentReceiptId,userId,clientId,done);
    }
};