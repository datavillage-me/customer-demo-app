'use strict';
/***********************************
 * Module dependencies. 
 ************************************/
import dotenv from 'dotenv';
import config from 'config';

dotenv.load();

var env = process.env.NODE_ENV || 'development';

module.exports = config;