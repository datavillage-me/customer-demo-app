/***********************************************************
 * oAuth model
 ***********************************************************/

/***********************************
 * Module dependencies.
 * @private
 ************************************/
import request from 'request';
import config from '../../../config/index';
import OAuthDatabase from './db';

/***********************************
 * Private constants.
 ************************************/

/***********************************
 * Private properties
 ************************************/

/***********************************
 * Private functions
 ************************************/

function _getClient(clientId,clientSecret,done){
    var url=config.getApiDomain()+'/clients/'+clientId;
    if(clientSecret!=null)
        url=config.getApiDomain()+'/clients/'+clientId+"?client_secret="+clientSecret;
    //get application access token
    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
            'Content-Type': 'application/json'
        }
    };
    request(options, function (error, response) { 
        if (error) { 
            console.log(error); 
            return done(null);
        }
        if(response !=null && response.statusCode==200){
            
            var client=JSON.parse(response.body);
            var arrayId=client["@id"].split("/");
            var clientId=arrayId[arrayId.length-1];
            OAuthDatabase.getClientRefreshTokens(clientId,function (refreshTokens){
                var returnBody={
                    id: clientId,
                    secret: client["dt:secret"],
                    name:client["dt:appName"],
                    description:client["dt:appUrl"],
                    callbacks: client["dt:allowedCallBack"],
                    metaData:refreshTokens,
                    grants: "authorization_code",
                    cageUrl: client["dt:cageUrl"],
                };
                return done(returnBody);       
            });        
        }
        else{
            console.log("Client does not exist");
            return done (null);
        }
    });
}

function _createClient(appName,appUrl,allowedCallback,done){
    var url=config.getApiDomain()+'/clients/';
    //get application access token
    var options = {
        'method': 'POST',
        'url': url,
        'headers': {
            'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded'],
        },
        form: {
          'appName': appName,
          'appUrl': appUrl,
          'allowedCallback': allowedCallback
        }
        
    };
    request(options, function (error, response) { 
        if (error) { 
            console.log(error); 
            return done(null);
        }
        if(response !=null && response.statusCode==201){
            
            var client=JSON.parse(response.body);
            var arrayId=client["@id"].split("/");
            var clientId=arrayId[arrayId.length-1];
            var returnBody={
                id: clientId,
                secret: client["dt:secret"],
                name:client["dt:appName"],
                description:client["dt:appUrl"],
                callbacks: client["dt:allowedCallBack"],
                metaData:null,
                grants: "authorization_code"
            };
            return done(returnBody);               
        }
        else{
            console.log("Client creation error");
            return done (null,"Client creation error");
        }
    });
}

function _updateClientMetadata(clientId,key,value,done){
        OAuthDatabase.storeClientRefreshToken(clientId,key,value);
        OAuthDatabase.getClientRefreshTokens(clientId,function (refreshTokens){
            return done(refreshTokens);
        });
}

function _deleteClient(clientId,clientSecret,done){
    var url=config.getApiDomain()+'/clients/'+clientId;
    if(clientSecret!=null)
        url=config.getApiDomain()+'/clients/'+clientId+"?client_secret="+clientSecret;
    //get application access token
    var options = {
        'method': 'DELETE',
        'url': url,
        'headers': {
            'Content-Type': 'application/json'
        }
    };
    request(options, function (error, response) { 
        if (error) { 
            console.log("Client not deleted");
            return done (null);
        }
        if(response.statusCode ==200){
            return done("Client sucessfully deleted");  
        }
        else{ 
            console.log(response.body);
            return done (response.body);
        }
    });
  }

  function _getApplicationToken(clientId,clientSecret,done){
    //get application access token
    var options = {
      'method': 'POST',
      'url': config.getApiDomain()+'/oauth/token',
      'headers': {
          'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded']
      },
      form: {
          'client_id': clientId,
          'client_secret': clientSecret
      }
      };
      request(options, function (error, response) { 
        if (error) { 
            console.log(error); 
            return done(null);
        }
        if(response !=null){
            return done(JSON.parse(response.body).access_token);
        }
        else
            return done(null);
      });
  }

  function _getUserTokensFromCode(req,clientId,clientSecret,code,done){
    //get application access token
    var options = {
      'method': 'POST',
      'url': config.rootDomainPassportApp+'/oauth/token',
      'headers': {
          'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded']
      },
      form: {
          'client_id': clientId,
          'client_secret': clientSecret,
          'code': code,
          'grant_type':'authorization_code'
      }
      };
      request(options, function (error, response) { 
        if (error) { 
            console.log(error); 
            return done(null);
        }
        if(response !=null){
            //store refresh token in client_metadata
            if(response.statusCode!=200){
                return done(null);
            }
            try{
                var responseJson=JSON.parse(response.body);
                var arrayId=responseJson.scope.split("/");//get scope id (=consentReceiptId)
                _updateClientMetadata(clientId,arrayId[arrayId.length-1],responseJson.refresh_token,function(refreshTokens){
                    if(refreshTokens==null){
                        console.log("error updating refresh token");
                        return done(null);
                    }
                    req.session.clientMetadata=refreshTokens; //update client metadada in session
                    return done(responseJson);
                });
            }
            catch(error){
                return done(null);
            }
        }
        else
             return done(null);
      });
  }

  function _getUserTokenFromRefreshToken(req,clientId,clientSecret,refreshToken,scope,done){
    //get application access token
    var options = {
      'method': 'POST',
      'url': config.rootDomainPassportApp+'/oauth/token',
      'headers': {
          'Content-Type': ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded']
      },
      form: {
          'client_id': clientId,
          'client_secret': clientSecret,
          'refresh_token': refreshToken,
          'scope': scope,
          'grant_type':'refresh_token'
      }
      }; 
      request(options, function (error, response) {
        if (error) { 
            console.log(error); 
            return done(null);
        }
        if(response !=null){
            //store refresh token in client_metadata
            if(response.statusCode!=200){
                return done(null);
            }
            try{
                var responseJson=JSON.parse(response.body);
                var arrayId=responseJson.scope.split("/");//get scope id (=consentReceiptId)
                _updateClientMetadata(clientId,arrayId[arrayId.length-1],responseJson.refresh_token,function(refreshTokens){
                    if(refreshTokens==null){
                        console.log("error updating refresh token");
                        return done(null);
                    }
                    req.session.clientMetadata=refreshTokens; //update client metadada in session
                    //return access token
                    return done(responseJson);
                });
            }
            catch(error){
                return done(null);
            }
        }
        else
            return done(null);
      });
  }

  function _setApplicationUser(req,userTokens){
      /* user tokens
      {
        "token_type": "Bearer",
        "expires_at": 1568775134,
        "expires_in": 21600,
        "refresh_token": "e5n567567...",
        "access_token": "a4b945687g...",
        "scope": "https://api.datavillage.me/consentReceipts/{{consent_receipt}}",
        "user_uri": "https://api.datavillage.me/users/{{user_id}}",
        }
        */
       if(userTokens!=null && userTokens.user_uri!=null && userTokens.scope!=null){
            var arrayId=userTokens.user_uri.split("/");
            var userId=arrayId[arrayId.length-1];
            userTokens.user_id=userId;

            arrayId=userTokens.scope.split("/");
            var consentReceiptId=arrayId[arrayId.length-1];
            var user=req.session.applicationUser;
            if(user==null){
                user={};
            }
            user[consentReceiptId]=userTokens;
            req.session.applicationUser=user;
            return req.session.applicationUser;
       }
       else{
            req.session.applicationUser=null;
            return null;
       }
  }

  function _getApplicationUser(req,consentReceiptId,done){
    if(consentReceiptId==null){
        return done(req.session.applicationUser);
    } 
    else{
        var user=req.session.applicationUser;
        if(user!=null && user[consentReceiptId]!=null){
            return done(user);
        }
        else{
            //check if refresh token exist in client metadata and initiate user if yes
            var clientMetadata=req.session.clientMetadata;
            if(clientMetadata!=null && clientMetadata[consentReceiptId]!=null){
                var refreshToken=clientMetadata[consentReceiptId];
                //get access token from refresh token for user
                _getUserTokenFromRefreshToken(req,req.session.clientId,req.session.clientSecret,refreshToken,"https://api.datavillage.me/consentReceipts/"+consentReceiptId,function (response){
                    if(response!=null)
                        return done(_setApplicationUser(req,response));
                    else {
                        _setApplicationUser(req,null);
                        return done(null);
                    }
                });
            }
            else{
                return done(null);
            }
        }
    }
}

/**
 * unlink all users linked to client id
 *
 * @param {string} applicationAccessToken 
 * @param {function} done 
 */
function _unlinkAllUsers(applicationAccessToken,done){
    if(applicationAccessToken!=null){
      var options = {
        'method': 'DELETE',
        'url': config.getApiDomain()+'/users/',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+applicationAccessToken
        }
      };
      request(options, function (error, response) { 
        if(response !=null){
          try{
            done(response.body);
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

  
/***********************************
 * Module exports.
 ************************************/
var self=module.exports={
    getClient: function(clientId,clientSecret,done){
        _getClient(clientId,clientSecret,done);
    },
    createClient: function(appName,appUrl,allowedCallback,done){
        _createClient(appName,appUrl,allowedCallback,done);
    },
    deleteClient: function(clientId,clientSecret,done){
        _deleteClient(clientId,clientSecret,done);
    },
    getDatavillageApplicationToken: function(done){
        _getApplicationToken(config.auth0ManagementClientID,config.auth0ManagementClientSecret,done);
    },
    getApplicationToken: function(clientId,clientSecret,done){
        _getApplicationToken(clientId,clientSecret,done);
    },
    getUserTokensFromCode: function(req,clientId,clientSecret,code,done){
        _getUserTokensFromCode(req,clientId,clientSecret,code,done);
    },
    setApplicationUser: function(req,userTokens){
        return _setApplicationUser(req,userTokens);
    },
    getApplicationUser: function(req,consentReceiptId,done){
         _getApplicationUser(req,consentReceiptId,done);
    }, 
    unlinkAllUsers:function(applicationAccessToken,done){
      return _unlinkAllUsers(applicationAccessToken,done);
    },
};
