var Promise = require('bluebird')
  , log = require('@recipher/log');

module.exports = function(message) {
  log.info(message);

  return new Promise(function(resolve, reject) {
    process.nextTick(resolve);
  });
};