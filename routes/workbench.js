/***********************************
 * cages route
 ************************************/
/***********************************
 * Module dependencies.
 * @private
 ************************************/
import express from 'express';
import User from '../server/lib/utils/user';
import Authentication from '../server/lib/utils/authentication';
var router = express.Router();
import config from '../config/index';
import Consent from '../server/lib/utils/consent';
import request from 'request';

/***********************************
 * Private functions
 ************************************/

function routePrivacyCenterWidget(req,res,consentReceiptSelected){
  Consent.getConsentReceiptChain(req.session.applicationAccessToken,consentReceiptSelected,null,function(consentReceipt){
    if(consentReceipt !=null){
      //store in session for second call to show the graph
      req.session.privacyCenterConsentReceipt=consentReceipt;
      Authentication.getApplicationUser(req,consentReceiptSelected,function (applicationUser){
        if(applicationUser){
          Consent.getConsentsChain(applicationUser[consentReceiptSelected].access_token,consentReceiptSelected,applicationUser[consentReceiptSelected].user_id,null,function(consents){
            renderPrivacyCenterWidget(req,res,consentReceiptSelected,consentReceipt,consents,true,applicationUser[consentReceiptSelected].access_token);
          });
        }
        else
          renderPrivacyCenterWidget(req,res,consentReceiptSelected,consentReceipt);
      });
    }
    else
      renderPrivacyCenterWidget(req,res,consentReceiptSelected);
  });
}

/***********************************
 * routes functions
 ************************************/

/* GET dashboard home */
router.get('/auth/workbench', function (req, res, next) {
  Consent.getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    renderWorkbench(req,res,consentReceiptsList);
  });
});

router.get('/auth/workbench/selectConsentReceipt', function (req, res, next) {
  var consentReceiptSelected=req.query.consentReceiptSelected;
  req.session.workbenchConsentReceiptSelected=consentReceiptSelected;
  Consent.getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
    //get default user if activated
    Authentication.getApplicationUser(req,consentReceiptSelected,function (applicationUser){
      renderWorkbench(req,res,consentReceiptsList,null,applicationUser[consentReceiptSelected].access_token);
    });
  });
});

/* POST generate privacy center widget */
router.get('/auth/workbench/privacyCenter/createWidget', function (req, res, next) {
  routePrivacyCenterWidget(req,res,req.session.workbenchConsentReceiptSelected);
});

/* GET generate privacy center widget */
router.get('/auth/workbench/privacyCenter/createWidgetCallback', function (req, res, next) {
  var consentReceiptSelected=req.session.workbenchConsentReceiptSelected;
  //get authorization code
  var code=req.query.code;
  if(code!=null){
    //get token
    Authentication.getUserTokensFromCode(req.session.clientId,req.session.clientSecret,code,function(response){
      if(response!=null){
        //store access token in session
        var applicationUser=Authentication.setApplicationUser(req,response);
        routePrivacyCenterWidget(req,res,consentReceiptSelected);
      }
      else 
        renderError(req, res,"Error occur during authorization flow");
    });
  }
  else
    routePrivacyCenterWidget(req,res,consentReceiptSelected);
});

/* GET generate graph data sources for privacy center widget */
router.get('/auth/workbench/privacyCenter/graph', function (req, res, next) {
  renderPrivacyCenterGraph(req,res,req.session.privacyCenterConsentReceipt);
});

/*import data*/
router.post('/auth/workbench/import', function (req, res, next) {
  var consentReceiptSelected=req.session.workbenchConsentReceiptSelected;
  var importStartDate=req.body.importStartDate;
  var importEndDate=req.body.importEndDate;

  Authentication.getApplicationUser(req,consentReceiptSelected,function (applicationUser){
  if(applicationUser){
    var options = {
      'method': 'Get',
      'url': 'https://api.datavillage.me/cages/'+consentReceiptSelected+'/importData?startDate='+importStartDate+'&endDate='+importEndDate,
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+applicationUser[consentReceiptSelected].access_token
      }
      };
      request(options, function (error, response) { 
        Consent.getConsentReceiptsList(req.session.applicationAccessToken,function (consentReceiptsList){
        if(response !=null && response.statusCode=="200"){
            //redirect to another url to avoid refresh page reimport
            res.redirect("/auth/workbench/query");
        }
        else
          renderError(req,res,response.body);
        });
      });
  }
  else
    renderError(req,res,"User not existing");
  });
});

/*query data*/
router.get('/auth/workbench/query', function (req, res, next) {
  var consentReceiptSelected=req.session.workbenchConsentReceiptSelected;
  Authentication.getApplicationUser(req,consentReceiptSelected,function (applicationUser){
    if(applicationUser){
      renderDataExplorationWidget(req,res,consentReceiptSelected,applicationUser[consentReceiptSelected].access_token);
    }
    else
    renderError(req,res,"User not existing");
  });
});

/*load data*/
router.get('/auth/workbench/load', function (req, res, next) {
  var consentReceiptSelected=req.session.workbenchConsentReceiptSelected;
  Authentication.getApplicationUser(req,consentReceiptSelected,function (applicationUser){
    if(applicationUser){
      var options = {
        'method': 'Post',
        'url': 'https://api.datavillage.me/cages/'+consentReceiptSelected+'/queryData',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+applicationUser[consentReceiptSelected].access_token
        }
        };
        request(options, function (error, response) { 
       
          if(response !=null && response.statusCode=="200"){
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(response.body);
          }
          else
            res.writeHead(401, {"Content-Type": "application/json"});
            res.end('Error during query');
          });
    }
    else
    renderError(req,res,"User not existing");
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
function renderWorkbench(req,res,consentReceiptsList,tab,userAccessToken){
  var hasConsentReceipts=false;
  if(consentReceiptsList!=null && consentReceiptsList.consentReceipts.length>0)
    hasConsentReceipts=true;
  var consentTab;  
  var dataTab;
  var algorithmTab;
  switch(tab){
    case "dataTab":
      dataTab='active';
    break;
    case "algorithmTab":
      algorithmTab='active';
    break;
    default:
      consentTab='active';
    break;
  }
  res.render('workbench', {
    layout: 'master',
    workbench:'active',
    consentTab:consentTab,
    dataTab:dataTab,
    algorithmTab:algorithmTab,
    consentReceiptsList:consentReceiptsList,
    hasConsentReceipts:hasConsentReceipts,
    applicationUserAccessToken:userAccessToken
  });
}

/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderPrivacyCenterWidget(req,res,consentReceiptSelected,consentReceipt,consentsChain,refreshOpener,userAccessToken){
  
  var dataCategoriesList="";

  if(consentReceipt.main["gl:dataCategories"]!=null){
    for(i=0;i<consentReceipt.main["gl:dataCategories"].length;i++){
      var dataCategory=consentReceipt.main["gl:dataCategories"][i]["gl:forPersonalDataCategory"]["@type"];
      dataCategoriesList+=dataCategory.split(":")[1]+",";
    }
    dataCategoriesList=dataCategoriesList.substr(0,dataCategoriesList.length-1);
  }
  
  var dataSources="{\"sources\":[";
  for(var i=0;i<consentReceipt.sources.length;i++){
    dataSources+="{\"name\":\""+consentReceipt.sources[i]["gl:name"]+"\",";
    dataSources+="\"description\":\""+consentReceipt.sources[i]["gl:description"]+"\",";
    var arrayId=consentReceipt.sources[i]["@id"].split("/");
    dataSources+="\"id\":\""+arrayId[arrayId.length-1]+"\"}";
    if(i!=consentReceipt.sources.length-1)
      dataSources+=",";
  }
  dataSources+="]}";
  
  
  var consents="{";
  if(consentsChain){
    if(consentsChain.main){
      //main consent
      arrayId=consentsChain.main["@id"].split("/");
      var consentStatus=consentsChain.main["gl:hasStatus"]["@id"];
      var consentStatusBoolean=false;
      if(consentStatus=="https://w3id.org/GConsent#ConsentStatusExplicitlyGiven")
        consentStatusBoolean=true;
      var consentDuration=consentsChain.main["gl:hasDuration"]["time:numericDuration"];
      consents+="\""+arrayId[arrayId.length-1]+"\":{\"status\":\""+consentStatusBoolean+"\",\"duration\":\""+consentDuration+"\"},";
    }
    if(consentsChain.sources){
      //data sources consent
      for(i=0;i<consentsChain.sources.length;i++){
        arrayId=consentsChain.sources[i]["@id"].split("/");
        consentStatus=consentsChain.sources[i]["gl:hasStatus"]["@id"];
        consentStatusBoolean=false;
        if(consentStatus=="https://w3id.org/GConsent#ConsentStatusExplicitlyGiven")
          consentStatusBoolean=true;
        
        var consentDuration=consentsChain.sources[i]["gl:hasDuration"]["time:numericDuration"];
        consents+="\""+arrayId[arrayId.length-1]+"\":{\"status\":\""+consentStatusBoolean+"\",\"duration\":\""+consentDuration+"\"},";
      }
    }
  }
  if(consentsChain)
    consents=consents.substr(0,consents.length-1);
  consents+="}";
  var rootDomainDemoApp=config.rootDomainDemoApp;
  var rootDomainPassportApp=config.rootDomainPassportApp;
  var callback=rootDomainDemoApp+'/auth/workbench/privacyCenter/createWidgetCallback';
  var consentReceiptUri="https://api.datavillage.me/consentReceipts/"+consentReceiptSelected;
  res.render('privacy-center-widget', {
    layout: 'privacyCenter',
    refreshOpener:refreshOpener,
    consentReceipt:{id:consentReceiptSelected,name:consentReceipt.main["gl:name"],description:consentReceipt.main["gl:description"],purpose:consentReceipt.main["gl:forPurpose"]["gl:description"]},
    dataSources:JSON.parse(dataSources),
    consents:JSON.parse(consents),
    dataCategoriesList:dataCategoriesList,
    actionActivateConsent:rootDomainPassportApp+'/oauth/authorize?client_id='+req.session.clientId+'&redirect_uri='+callback+'&response_type=code&scope='+consentReceiptUri+'&state=empty',
    actionRevokeConsent:rootDomainPassportApp+'/oauth/deauthorize',
    callback:callback,
    consentReceiptUri:consentReceiptUri,
    userAccessToken:userAccessToken
  });
} 


/**
 * render privacy center graph home
 * @param {req} request
 * @param {res} response
 */
function renderPrivacyCenterGraph(req,res,consentReceipt){
  var graph="{\"results\": [{\"columns\": [\"user\", \"entity\"],\"data\": [{\"graph\": {";

  var graphRelationship="[";
  var graphNodes="[{\"id\": \"person\",\"labels\": [\"User\"],\"properties\": {\"userId\": \"person\"}},";
  for(var i=0;i<consentReceipt.sources.length;i++){
    var arrayId=consentReceipt.sources[i]["@id"].split("/");
    graphNodes+="{\"id\": \""+arrayId[arrayId.length-1]+"\",\"labels\": [\""+arrayId[arrayId.length-1]+"\"],\"properties\": {}}";
    graphRelationship+="{\"id\": \""+(i+1)+"\",\"type\": \""+consentReceipt.sources[i]["gl:name"]+"\",\"startNode\": \"person\",\"endNode\": \""+arrayId[arrayId.length-1]+"\"}";
    if(i!=consentReceipt.sources.length-1){
      graphNodes+=",";
      graphRelationship+=",";
    }
      
  }
  graphNodes+="],";
  graphRelationship+="]";

  graph+="\"nodes\":"+graphNodes+"\"relationships\":"+graphRelationship;
  graph+="}}]}],\"errors\": []}";

  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(graph);
}


/**
 * render dashboard home
 * @param {req} request
 * @param {res} response
 */
function renderDataExplorationWidget(req,res,consentReceiptSelected,userJwtToken,error){
  res.render('data-exploration-widget', {
    layout: 'master',
    workbench:'active',
    consentReceipt:{id:consentReceiptSelected},
    userJwtToken:userJwtToken
  });
}

/**
 * render error
 * @param {req} request
 * @param {res} response
 */
function renderError(req,res,error){
  res.render('error', {
    layout: 'singlePage',
    title: "Error",
    message:error
  });
}

module.exports = router;
