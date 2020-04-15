/***********************************
 * dataBeam route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';

var router = express.Router();

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/applications', function (req, res, next) {
  renderApplications(req,res);
});


/***********************************
 * rendering functions
 ************************************/

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderApplications(req,res){
  res.render('applications', {
    layout: 'master',
    applications:'active',
    user:{id:User.getUserId(req.user)}
  });
}


module.exports = router;
