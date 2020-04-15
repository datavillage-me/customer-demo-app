/***********************************************************
 *  user management
 ***********************************************************/

/***********************************
 * Module dependencies.
 * @private
 ************************************/
import config from '../../../config/index';
var ManagementClient = require('auth0').ManagementClient;
 

/***********************************
 * Private constants.
 ************************************/

/***********************************
 * Private properties
 ************************************/

/***********************************
 * Private functions
 ************************************/

 /**
 * load user profile data in user object
 *
 * @param {Object} authenticated user by auth0
 * @param {function} call-back function
 * @return {Object} updated user with metadata loaded as property
 * @private
 */
function _loadUserProfile(profile,cb){
    var ManagementClient = require('auth0').ManagementClient;

    var management = new ManagementClient({
        domain: config.auth0Domain,
        clientId: config.auth0ManagementClientID,
        clientSecret: config.auth0ManagementClientSecret,
        scope: 'read:users read:user_idp_tokens read:users_app_metadata'
        });
     management.getUser({ id: _getUserId(profile)}, function (err, user) {
        if(user){
            var updatedProfile=profile;
            //set token data 
           if(user.user_metadata){
            }
            //set user data
           /* updatedProfile=_setUsername(updatedProfile,user.short_name);
            updatedProfile=_setFirstname(updatedProfile,user.given_name);
            updatedProfile=_setLastname(updatedProfile,user.family_name);
            updatedProfile=_setGender(updatedProfile,user.gender);
            updatedProfile=_setBirthdate(updatedProfile,user.birthday);
            updatedProfile=_setPicture(updatedProfile,user.picture_large);*/
            return cb(updatedProfile);
        }
    });
}


/**
 * update user meta-deta in auth0 user database
 *
* @param {Object} authenticated user by auth0
 * @param {String} field to update/create
 * @param {function} call-back function
 * @private
 */
function _setUserMetaData(profile,field,value,cb){
    var ManagementClient = require('auth0').ManagementClient;
    var management = new ManagementClient({
        domain: config.auth0Domain,
        clientId: config.auth0ManagementClientID,
        clientSecret: config.auth0ManagementClientSecret,
        scope: 'update:users_app_metadata'
        });
    var metadata = {};

    metadata[field] = value;
    management.updateUserMetadata({ id: _getUserId(profile)},metadata, function (err,user) {
        if(user){
            return cb(profile);
        }
    });
    
}

/**
 * delete user meta-deta in auth0 user database
 *
* @param {Object} authenticated user by auth0
 * @param {String} field to update/create
 * @param {String} value 
 * @param {function} call-back function
 * @private
 */
function _deleteUserMetaData(profile,field,cb){
    var ManagementClient = require('auth0').ManagementClient;
    var management = new ManagementClient({
        domain: config.auth0Domain,
        clientId: config.auth0ManagementClientID,
        clientSecret: config.auth0ManagementClientSecret,
        scope: 'update:users_app_metadata'
        });
    var metadata = {};
    metadata[field] = "";
    management.updateUserMetadata({ id: _getUserId(profile)},metadata, function (err,user) {
        if(user){
            return cb(profile);
        }
    });
    
}

/**
 * get userId for user
 *
 * @param {Object} profile passport object 
 * @return {String} user id 
 * @private
 */
function _getUserId (profile) {
    return profile.user_id;
}

/**
 * set user id 
 *
 * @param {Object} profile passport object 
 * @param {String} id access token
 * @private
 */
function _setUserId (profile,id) {
    profile.user_id=id;
    return profile;
}

/**
 * get userJWTToken for user
 *
 * @param {Object} profile passport object 
 * @return {String} JWTToken
 * @private
 */
function _getUserJWTToken (profile) {
    return profile.JWTToken;
}

/**
 * set userJWTToken
 *
 * @param {Object} profile passport object 
 * @param {String} id JWTToken
 * @private
 */
function _setUserJWTToken (profile,JWTToken) {
    profile.JWTToken=JWTToken;
    return profile;
}


/**
 * get useremail for user
 *
 * @param {Object} profile passport object 
 * @return {String} user email 
 * @private
 */
function _getUserEmail (profile) {
    return profile.emails[0].value;
}


/**
 * set username for user
 *
 * @param {Object} profile passport object 
 * @param {String} username 
 * @return {Object} profile passport object
 * @private
 */
function _setUsername (profile,username) {
    profile.profile.username=username;
    return profile;
}

/**
 * get Profile username for user
 *
 * @param {Object} profile passport object 
 * @return {String} username 
 * @private
 */
function _getUsername (profile) {
    return profile.profile.username;
}

/**
 * set firstname token for user
 *
 * @param {Object} profile passport object 
 * @param {String} firstname 
 * @return {Object} profile passport object
 * @private
 */
function _setFirstname (profile,firstname) {
    profile.profile.firstname=firstname;
    return profile;
}

/**
 * get Profile firstname for user
 *
 * @param {Object} profile passport object 
 * @return {String} firstname 
 * @private
 */
function _getFirstname(profile) {
    return profile.profile.firstname;
}

/**
 * set lastname token for user
 *
 * @param {Object} profile passport object 
 * @param {String} lastname 
 * @return {Object} profile passport object
 * @private
 */
function _setLastname (profile,lastname) {
    profile.profile.lastname=lastname;
    return profile;
}

/**
 * get Profile lastname for user
 *
 * @param {Object} profile passport object 
 * @return {String} lastname 
 * @private
 */
function _getLastname (profile) {
    return profile.profile.lastname;
}

/**
 * set birthdate token for user
 *
 * @param {Object} profile passport object 
 * @param {String} birthdate 
 * @return {Object} profile passport object
 * @private
 */
function _setBirthdate (profile,birthdate) {
    profile.profile.birthdate=birthdate;
    return profile;
}

/**
 * get Profile birthdate for user
 *
 * @param {Object} profile passport object 
 * @return {String} birthdate 
 * @private
 */
function _getBirthdate (profile) {
    return profile.profile.birthdate;
}

/**
 * set gender token for user
 *
 * @param {Object} profile passport object 
 * @param {String} gender 
 * @return {Object} profile passport object
 * @private
 */
function _setGender (profile,gender) {
    profile.profile.gender=gender;
    return profile;
}

/**
 * get Profile gender for user
 *
 * @param {Object} profile passport object 
 * @return {String} gender 
 * @private
 */
function _getGender (profile) {
    return profile.profile.gender;
}

/**
 * set adress token for user
 *
 * @param {Object} profile passport object 
 * @param {String} adress 
 * @return {Object} profile passport object
 * @private
 */
function _setAdress (profile,adress) {
    profile.profile.adress=adress;
    return profile;
}

/**
 * get Profile adress for user
 *
 * @param {Object} profile passport object 
 * @return {String} adress 
 * @private
 */
function _getAdress (profile) {
    return profile.profile.adress;
}

/**
 * set city token for user
 *
 * @param {Object} profile passport object 
 * @param {String} city 
 * @return {Object} profile passport object
 * @private
 */
function _setCity (profile,city) {
    profile.profile.city=city;
    return profile;
}

/**
 * get Profile city for user
 *
 * @param {Object} profile passport object 
 * @return {String} city 
 * @private
 */
function _getCity (profile) {
    return profile.profile.city;
}

/**
 * set postalcode token for user
 *
 * @param {Object} profile passport object 
 * @param {String} postalcode 
 * @return {Object} profile passport object
 * @private
 */
function _setPostalcode (profile,postalcode) {
    profile.profile.postalcode=postalcode;
    return profile;
}

/**
 * get Profile postalcode for user
 *
 * @param {Object} profile passport object 
 * @return {String} postalcode 
 * @private
 */
function _getPostalcode (profile) {
    return profile.profile.postalcode;
}

/**
 * set country token for user
 *
 * @param {Object} profile passport object 
 * @param {String} country 
 * @return {Object} profile passport object
 * @private
 */
function _setCountry (profile,country) {
    profile.profile.country=country;
    return profile;
}

/**
 * get Profile country for user
 *
 * @param {Object} profile passport object 
 * @return {String} country 
 * @private
 */
function _getCountry (profile) {
    return profile.profile.country;
}

/**
 * set picture token for user
 *
 * @param {Object} profile passport object 
 * @param {String} picture 
 * @return {Object} profile passport object
 * @private
 */
function _setPicture (profile,picture) {
    profile.profile.picture=picture;
    return profile;
}

/**
 * get Profile picture for user
 *
 * @param {Object} profile passport object 
 * @return {String} picture 
 * @private
 */
function _getPicture (profile) {
    return profile.profile.picture;
}


/***********************************
 * Module exports.
 ************************************/
var self=module.exports={
    loadUserProfile:function(user,cb){
        return _loadUserProfile(user,cb);
    },
    getUserId:function(profile){
        return _getUserId(profile);
    },
    setUserJWTToken:function(profile,JWTToken){
        return _setUserJWTToken(profile,JWTToken);
    },
    getUserJWTToken:function(profile){
        return _getUserJWTToken(profile);
    },
    setUserId:function(profile,id){
        return _setUserId(profile,id);
    },
    getUserEmail:function(profile){
        return _getUserEmail(profile);
    },
    getPicture:function(profile){
        return _getPicture(profile);
    },
    setUsername:function(profile,username){
        _setUsername(profile,username);
    },
    getUsername:function(profile){
        return _getUsername(profile);
    },
    setFirstname:function(profile,firstname){
        _setFirstname(profile,firstname);
    },
    getFirstname:function(profile){
        return _getFirstname(profile);
    },
    setLastname:function(profile,lastname){
        _setLastname(profile,lastname);
    },
    getLastname:function(profile){
        return _getLastname(profile);
    },
    setBirthdate:function(profile,birthdate){
        _setBirthdate(profile,birthdate);
    },
    getBirthdate:function(profile){
        return _getBirthdate(profile);
    },
    setGender:function(profile,gender){
        _setGender(profile,gender);
    },
    getGender:function(profile){
        return _getGender(profile);
    },
    setAdress:function(profile,adress){
        _setAdress(profile,adress);
    },
    getAdress:function(profile){
        return _getAdress(profile);
    },
    setCity:function(profile,city){
        _setCity(profile,city);
    },
    getCity:function(profile){
        return _getCity(profile);
    },
    setPostalcode:function(profile,postalcode){
        _setPostalcode(profile,postalcode);
    },
    getPostalcode:function(profile){
        return _getPostalcode(profile);
    },
    setCountry:function(profile,country){
        _setCountry(profile,country);
    },
    getCountry:function(profile){
        return _getCountry(profile);
    }
};