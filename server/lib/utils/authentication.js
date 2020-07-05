/***********************************************************
 * oAuth model
 ***********************************************************/

/***********************************
 * Module dependencies.
 * @private
 ************************************/
import request from 'request';
import config from '../../../config/index';
var ManagementClient = require('auth0').ManagementClient;

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
    var management = new ManagementClient({
        domain: config.auth0Domain,
        clientId: config.auth0ManagementClientID,
        clientSecret: config.auth0ManagementClientSecret,
        scope: 'read:clients read:client_keys'
        });
        management.getClient(
          {
            client_id: clientId
          }, function (err, client) {
            if(client!=null){
                
                if(clientSecret==null || (clientSecret!=null && clientSecret==client.client_secret)){
                    var returnBody={
                        id: client.client_id,
                        secret: client.client_secret,
                        name:client.name,
                        description:client.description,
                        callbacks: client.callbacks,
                        metaData:client.client_metadata,
                        grants: "authorization_code"
                    };
                  return done(returnBody);
                }
                else{
                    console.log("Client secret not valid");
                    return done (null);
                }
            }
            else
                return done (null);
      });
  }

  function _updateClientMetadata(clientId,key,value,done){
    var management = new ManagementClient({
        domain: config.auth0Domain,
        clientId: config.auth0ManagementClientID,
        clientSecret: config.auth0ManagementClientSecret,
        scope: 'update:clients'
        });
        var param="{\""+key+"\":\""+value+"\"}";
        management.updateClient(
        { client_id: clientId},
        {"client_metadata":JSON.parse(param)}, function (err, client) {
            if(err){
                console.log(err);
                done(null);
            }               
            else{
                done(client);
            }   
    });
}

  function _getApplicationToken(clientId,clientSecret,done){
    //get application access token
    var options = {
      'method': 'POST',
      'url': 'https://'+config.getApiDomain()+'/oauth/token',
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

  function _getUserTokensFromCode(clientId,clientSecret,code,done){
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
                _updateClientMetadata(clientId,arrayId[arrayId.length-1],responseJson.refresh_token,function(client){
                    if(client==null)
                        console.log("error updating refresh token");
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
                _updateClientMetadata(clientId,arrayId[arrayId.length-1],responseJson.refresh_token,function(client){
                    if(client==null){
                        console.log("error updating refresh token");
                        return done(null);
                    }
                    req.session.clientMetadata=client.metaData; //update client metadada in session
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
       else
        return null;
  }

  function _getApplicationUser(req,consentReceiptId,done){
    if(consentReceiptId==null){
        return done(req.session.applicationUser);
    } 
    else{
        var user=req.session.applicationUser;
        if(user!=null){
            return done(user);
        }
        else{
            //check if refresh token exist in client metadata and initiate user if yes
            var clientMetadata=req.session.clientMetadata;
            if(clientMetadata!=null && clientMetadata[consentReceiptId]!=null){
                var refreshToken=clientMetadata[consentReceiptId];
                //get access token from refresh token for user
                _getUserTokenFromRefreshToken(req,req.session.clientId,req.session.clientSecret,refreshToken,"https://api.datavillage.me/consentReceipts/"+consentReceiptId,function (response){
                    return done(_setApplicationUser(req,response));
                });
            }
            else{
                return done(null);
            }
        }
    }
}

/***********************************
 * Module exports.
 ************************************/
var self=module.exports={
    getClient: function(clientId,clientSecret,done){
        _getClient(clientId,clientSecret,done);
    },
    getDatavillageApplicationToken: function(done){
        _getApplicationToken(config.auth0ManagementClientID,config.auth0ManagementClientSecret,done);
    },
    getApplicationToken: function(clientId,clientSecret,done){
        _getApplicationToken(clientId,clientSecret,done);
    },
    getUserTokensFromCode: function(clientId,clientSecret,code,done){
        _getUserTokensFromCode(clientId,clientSecret,code,done);
    },
    setApplicationUser: function(req,userTokens){
        return _setApplicationUser(req,userTokens);
    },
    getApplicationUser: function(req,consentReceiptId,done){
         _getApplicationUser(req,consentReceiptId,done);
    }
};
