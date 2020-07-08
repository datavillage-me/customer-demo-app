/***********************************
 * Module dependencies. 
 ************************************/
import express from 'express';
import enforce from 'express-sslify';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import exphbs from 'express-handlebars';
import session from 'express-session';
import Logger from './lib/utils/logger';
import passport from 'passport';
import Auth0Strategy from 'passport-auth0';
import flash from 'connect-flash';
import config from '../config/index';
import User from '../server/lib/utils/user';
import userInViews from './lib/middleware/userInViews';
import dateFormat from 'dateformat';

//routes
import authRouter from '../routes/auth';
import indexRouter from '../routes/index';
import applicationsRouter from '../routes/applications';
import consentsRouter from '../routes/consents';
import workbenchRouter from '../routes/workbench';

/***********************************
 * Set up passports
 ************************************/
var strategy = new Auth0Strategy(
  {
    domain: config.auth0Domain,
    clientID: config.auth0ClientID,
    clientSecret: config.auth0ClientSecret,
    callbackURL:config.auth0CallbackURL 
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    // asynchronous verification, for effect...
    console.log("2"+profile);
      profile=User.setUserJWTToken(profile,extraParams.id_token);
      User.loadUserProfile(profile,function (profile) {
        console.log("3"+profile);
        if (profile){
          return done(null, profile);
        }
      });
  }
);


// You can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


passport.use("datavillage",strategy);


/***********************************
 * App creation
 ************************************/
var app = express();

/***********************************
 * Templating
 ************************************/
var hbs = exphbs.create(
  { defaultLayout: 'master', 
    extname: '.handlebars',
    layoutsDir:'views/layouts',
    partialsDir:'views/partials',
    helpers: {
      formatDate: function (datetime, format) { return dateFormat(datetime,format); },
      ifEqual: function(v1, v2,options) {
        if(v1==v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifOr: function(v1, v2, v3,v4,options) {
        if(v1==null || v2==null || v3==null || v4==null ) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifConsentActif:function(consents,id,options){
        if(consents[id]!=null && consents[id].status=="true"){
          return options.fn(this);
        }
        else
          return options.inverse(this);
      }
    }
  });

app.engine('handlebars', hbs.engine);


/***********************************
 * Set up app properties & engine
 ************************************/
 var sess = {
  secret: config.secret,
  cookie: {},
  resave: false,
  saveUninitialized: true
};

if (config.env === 'production' || config.env === 'staging') {
  //sess.cookie.secure = true; // serve secure cookies, requires https
  //app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(session(sess));
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join('client')));
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, '../views'));
app.use(Logger.getRequestLogger());

app.use(flash());

/***********************************
 * auth message failure
 ************************************/
app.use(function (req, res, next) {
  if (req && req.query && req.query.error) {
    req.flash('error', req.query.error);
  }
  if (req && req.query && req.query.error_description) {
    req.flash('error_description', req.query.error_description);
  }
  next();
});


/***********************************
 * Routes
 ************************************/
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
app.use(userInViews());

app.all('*', function(req,res,next){
  if (req.path === '/' || req.path === '/home' || req.path === '/login' || req.path === '/callback' || req.path === '/error')
    next();
  else
    ensureAuthenticated(req,res,next);  
});

// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 

app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/', applicationsRouter);
app.use('/', consentsRouter);
app.use('/', workbenchRouter);



/***********************************
 * Error handling
 ************************************/
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler
// Will print stacktrace
if (config.env === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      layout: 'singlePage',
      message: err.message,
      error: {}
    });
  });
}

// Production error handler
// No stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    layout: 'singlePage',
    message: err.message,
    error: {}
  });
});


/***********************************
 * Start server
 ************************************/

var server=app.listen(config.port, function()  {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("Datavillage developer portal listening at http://%s:%s", host, port);
});


/***********************************
 * Module exports.
 ************************************/
module.exports = app;