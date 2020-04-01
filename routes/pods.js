/***********************************
 * pods route
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

/* GET dashboard home */
router.get('/pods', function (req, res, next) {
  renderPods(req,res);
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
  var rootDomainDemoApp=config.rootDomainDemoApp;
  var rootDomainPassportApp=config.rootDomainPassportApp;
  res.render('pods', {
    layout: 'master',
    pods:'active',
    action:rootDomainPassportApp+'/pods/activate',
    callback:rootDomainDemoApp+'/pods',
    callbackError:rootDomainDemoApp+'/error',
    accessToken:config.accessToken
  });
}

module.exports = router;
