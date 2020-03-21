/***********************************
 * sources route
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
router.get('/sources', function (req, res, next) {
  renderSources(req,res);
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
  res.render('sources', {
    layout: 'master',
    sources:'active'
  });
}


module.exports = router;
