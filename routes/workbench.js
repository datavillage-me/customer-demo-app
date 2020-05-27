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
router.get('/auth/workbench', function (req, res, next) {
  renderWorkbench(req,res);
});

/* GET import */
router.get('/auth/workbench/import', function (req, res, next) {
  renderWorkbench(req,res,"import");
});

/* GET graphql */
router.get('/auth/workbench/graphql', function (req, res, next) {
    renderWorkbench(req,res,"graphql");
});


/***********************************
 * rendering functions
 ************************************/

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderWorkbench(req,res,tab){
  var importTab;
  var graphqlTab;
  switch(tab){
    case "graphql":
      graphqlTab='active';
    break;
    case "import":
      importTab='active';
    break;
    default:
      importTab='active';
    break;
  }
  res.render('workbench', {
    layout: 'master',
    workbench:'active',
    graphql:graphqlTab,
    import:importTab
  });
}

module.exports = router;
