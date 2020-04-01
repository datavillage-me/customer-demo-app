/***********************************
 * sources route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';
import request from 'request';
import config from '../config/index';
var router = express.Router();

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

function _processData(cb) {
  var jwtToken="eyJhbGciOiJLTVMiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL2FwaS5kYXRhdmlsbGFnZS5tZS8iLCJzdWIiOiJjZGUwNjU4NS1lODQ4LTQ5NzgtYWQwOS03ZGQzNDdiN2RmN2IiLCJ1cmkiOiJodHRwczovL2FwaS5kYXRhdmlsbGFnZS5tZS91c2Vycy9jZGUwNjU4NS1lODQ4LTQ5NzgtYWQwOS03ZGQzNDdiN2RmN2IiLCJhenAiOiJVSDBIVG9raEoxUnNEMkYybWZYZXRRQTJncWxIWnNqUSIsImlhdCI6IjIwMjAtMDMtMjlUMDY6Mjc6MjAuNDYwWiIsImV4cCI6bnVsbCwic2NvcGUiOiJzb3VyY2VzOmFjdGl2YXRlLGNvbnNlbnRzOmNyZWF0ZSxjYWdlczppbXBvcnREYXRhLGNhZ2VzOnByb2Nlc3NEYXRhIn0.AQICAHiicquW0AOzDlrHF9VXK3pZkmcMQWFNDW2TSJ2YbFcC0gHPivmGJxAhIbui7wnP39tCAAACOjCCAjYGCSqGSIb3DQEHBqCCAicwggIjAgEAMIICHAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAyVWR5dNnNBGaelzg4CARCAggHtT5n/D+x3u81j2nLq5fXbjnuLIgOby8zyx48SeYB26DRv/mGhPDeo+AVJBLOlbCL9eSbZDDrjnHzmI4O7eQ8PnWxZ2y+xmwBLltO2L3qd5/Tyh4vXgkY1nAHj0MMPszAPh3KJbz/cEshnT2pbNnqI0IsUPYANpLtJ7cf8LgX1maRsEGmT9E31v2QDOkNVWX++CgjI0wBbIwJrZcpRT7L2Gn4IUux+tVZ0kWVUhFwciBOJApAtx7eaJLsy+aofdM9mNDky88rmueW0NdbPVfgS4OXNl78fkSsE1kk2DaszSjLYEgbEnj3D00Sz6/RrMnfqdU+GE9mOOfYCjksoKvbUuh3yUt5BEyVVHkHDCdnM+QC9hNhXx7j8A0seBmGFaL63rr9I73u6/gjfzi3a+AZR0bOgmFhExtFAobP72rZ0US1dWh0RgpN0t7TStP8G6286aaTXpw6knqY8ecVbJOZxG+GjMZzz3//V93rTuYUbUyKK/7Vdhyuhc+sES1GmfHtS7ncctnmdofYRLecyC27oRigjSoqkJfOyfYKyvQt4pmk8lTK9o2WilEYvFBZhmjxea+qmqtuWgjOBxVtpr97NxN85y5skrfVwv3RTKa7wUyLxUWBKvxoT1fZ0IZ+1ddapinKuE1kPSnoVTI2ckQ==";
  var options = {
    'method': 'POST',
    'url': 'https://api.datavillage.me/UH0HTokhJ1RsD2F2mfXetQA2gqlHZsjQ/8a158c699a280c44454ac36c069e392e61d5762fb11d91c46d093cb030dde6c15fdde747131ca9a361ae8f32e75d307a033da4ecd725a5eeba8f29313c4119ac/processData',
    'headers': {
      'Content-Type': ['application/json', 'application/json'],
      'Authorization': 'Bearer '+jwtToken
    },
    body: JSON.stringify({"behavior":{"year":2020,"week":4}})
  
  };
  request(options, function (error, response) { 
    if (error) throw new Error(error);
    return cb(JSON.parse(response.body));
  });

}

/* GET dashboard home */
router.get('/sources', function (req, res, next) {
  renderSources(req,res);
});


/* GET dashboard home */
router.get('/calendar', function (req, res, next) {
  _processData(function cb(body){
    renderCalendar(req,res,body);
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
function renderSources(req,res){
  var rootDomainDemoApp=config.rootDomainDemoApp;
  var rootDomainPassportApp=config.rootDomainPassportApp;
  res.render('sources', {
    layout: 'master',
    sources:'active',
    action:rootDomainPassportApp+'/sources/activate',
    callback:rootDomainDemoApp+'/sources',
    callbackError:rootDomainDemoApp+'/error',
    accessToken:config.accessToken
  });
}

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderCalendar(req,res,body){
  var behaviors="{";
  var outputBehaviors=body["dt:behaviors"];
  
  for (var i=0;i<outputBehaviors.length;i++){
    var behaviorData=outputBehaviors[i]["dt:BehaviorData"];
    var timeStamp=behaviorData["time:inXSDDateTimeStamp"];
    var level=behaviorData["dt:level"];
    var booleanLevelIsHigh=false;
    var booleanLevelIsMedium=false;
    var booleanLevelIsLow=false;
    if(behaviorData["dt:level"]=="High")
      booleanLevelIsHigh=true;
    if(behaviorData["dt:level"]=="Medium")
      booleanLevelIsMedium=true;
    if(behaviorData["dt:level"]=="Low")
      booleanLevelIsLow=true;
    behaviors+="\"date"+timeStamp.substring(0, 2)+"\":{\"level\":\""+behaviorData["dt:level"]+"\",\"distance\":\""+behaviorData["dt:distance"]+"\",\"description\":\""+behaviorData["dt:description"]+"\",\"isHigh\":"+booleanLevelIsHigh+",\"isMedium\":"+booleanLevelIsMedium+",\"isLow\":"+booleanLevelIsLow+"},";
  }
  behaviors=behaviors.substring(0, behaviors.length - 1);
  behaviors+="}";
  console.log(JSON.parse(behaviors));
  res.render('calendar', {
    layout: 'master',
    sources:'active',
    behaviors:JSON.parse(behaviors)
  });
}



module.exports = router;
