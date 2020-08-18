/***********************************
 * db singleton to access and initialize db oAuth  
 ************************************/

/***********************************
 * Module dependencies.
 * @private
 ************************************/
import sqlite3 from 'sqlite3';

/***********************************
 * Private constants.
 ************************************/
var _db
/***********************************
 * Private properties
 ************************************/

  function _initialize(){
    _db = new sqlite3.Database('./db/oAuth.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
      });
     _db.run("CREATE TABLE IF NOT EXISTS oAuth (clientId TEXT,consentReceiptId TEXT,refreshToken TEXT)");
  }

  function _storeClientRefreshToken(clientId,consentReceiptId,refreshToken){
    let sql = 'INSERT INTO oAuth VALUES (?,?,?) ';
    _db.run(sql,[clientId,consentReceiptId,refreshToken], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        return console.log('A row has been inserted with '+id);
      });
  }

  function _getClientRefreshTokens(clientId){
     let sql = 'SELECT * FROM oAuth WHERE clientId  = ? ';
    _db.get(sql, [clientId], (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        var refreshTokens={};
        if(row!=null){
            for (var i=0;i<row.length;i++){
                var consentReceiptId=row[i].consentReceiptId;
                var refreshToken=row[i].refreshToken;
                refreshTokens[consentReceiptId]=refreshToken;
            }
        }
        return refreshTokens;
      });
 }

function _deleteClientRefreshToken(clientId,consentReceiptId){
    _db.run(`DELETE FROM oAuth WHERE clientId=? AND consentReceiptId=?`, [clientId,consentReceiptId], function(err) {
        if (err) {
            return console.error(err.message);
        }
        return console.log(`Row(s) deleted ${this.changes}`);
    });
}
/***********************************
 * Module exports.
 ************************************/
var self=module.exports={
    initialize:function(){
       return _initialize();
    },
    storeClientRefreshToken:function(clientId,consentReceiptId,refreshToken){
        return _storeClientRefreshToken(clientId,consentReceiptId,refreshToken);
    },
    getClientRefreshTokens:function(clientId){
        _getClientRefreshTokens(clientId);
    },
    deleteClientRefreshToken:function(clientId,consentReceiptId){
        _deleteClientRefreshToken(clientId,consentReceiptId);
   }
};
