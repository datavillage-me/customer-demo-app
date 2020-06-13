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
                        grants: "authorization_code"
                    };
                  done(returnBody);
                }
                else{
                    console.log("Client secret not valid");
                    done (null);
                }
            }
            else
                done (null);
      });
  }

  function _getApplicationToken(clientId,clientSecret,done){
    //get application access token
    var options = {
      'method': 'POST',
      'url': 'https://api.datavillage.me/oauth/token',
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
            done(JSON.parse(response.body).access_token);
        }
        else
          done(null);
      });
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
    }
};
