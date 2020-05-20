/***********************************
 * index route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
var express = require('express');
var router = express.Router();

/***********************************
 * Private functions
 ************************************/

/***********************************
 * routes functions
 ************************************/
/* GET home login/register page. */
router.get('/', function (req, res, next) {
  res.redirect("/home");
});

/* GET home login/register page. */
router.get('/home', function (req, res, next) {
  renderHome(req, res);
});

/***********************************
 * rendering functions
 ************************************/

/**
 * render  home
 * @param {req} request
 * @param {res} response
 */
function renderHome(req,res){
  res.render('home', {
    layout: 'master-anonymous',
    home:'active',
  });
}


module.exports = router;