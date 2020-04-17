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

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/consents', function (req, res, next) {
  renderConsents(req,res);
});


/***********************************
 * rendering functions
 ************************************/

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderConsents(req,res){
  res.render('consents', {
    layout: 'master',
    consents:'active',
    user:{id:User.getUserId(req.user)}
  });
}


module.exports = router;
