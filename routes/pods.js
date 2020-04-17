/***********************************
 * pods route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';
import User from '../server/lib/utils/user';
var router = express.Router();

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/pods', function (req, res, next) {
  renderPods(req,res);
});

/* GET select pod */
router.get('/auth/pods/select', function (req, res, next) {
  renderPodsSelect(req,res);
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
  res.render('pods', {
    layout: 'master',
    pods:'active',
    user:{id:User.getUserId(req.user)}
  });
}

/**
 * render pods select
 * @param {req} request
 * @param {res} response
 */
function renderPodsSelect(req,res){
  res.render('pods-select', {
    layout: 'master',
    pods:'active',
    user:{id:User.getUserId(req.user)}
  });
}

module.exports = router;
