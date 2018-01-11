'use strict'
require('dotenv').config();
console.log()
module.exports = {
  NODE_ENV: '"production"',
  HABITICA_USER_ID: `"${process.env.HABITICA_USER_ID}"`,
  HABITICA_API_KEY: `"${process.env.HABITICA_API_KEY}"`,
}
