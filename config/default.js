'use strict';

import dotenv from 'dotenv';
dotenv.load();

module.exports = {
  env: 'development',
  port: process.env.PORT || 3001,
  secret: process.env.SESSION_SECRET,
  rootDomainDemoApp: process.env.ROOT_DOMAIN_DEMO_APP,
  rootDomainPassportApp: process.env.ROOT_DOMAIN_PASSPORT_APP,
  accessToken: process.env.ACCESS_TOKEN,
};