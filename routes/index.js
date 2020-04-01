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
  res.redirect("/pods");
});


module.exports = router;