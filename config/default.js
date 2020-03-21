'use strict';

import dotenv from 'dotenv';
dotenv.load();

module.exports = {
  env: 'development',
  port: process.env.PORT || 3001,
  secret: process.env.SESSION_SECRET
};