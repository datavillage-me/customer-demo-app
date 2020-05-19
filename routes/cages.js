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

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/cages', function (req, res, next) {
    renderCages(req,res);
});


/***********************************
 * rendering functions
 ************************************/

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderCages(req,res){
  res.render('cages', {
    layout: 'master',
    cages:'active',
    user:{id:User.getUserId(req.user)}
  });
}

module.exports = router;
