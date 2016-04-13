var Promise = require('bluebird')
  , configuration = require('@ftbl/configuration')
  , sendgrid = require('sendgrid')(configuration('sendgrid:key'));

var mapMessage = function(message) {
  return {
    subject: message.subject
  , text: message.text
  , html: message.html
  , to: message.to.email
  , toname: message.to.name
  , from: message.from_email
  , fromname: message.from_name
  , replyto: headers['Reply-To']
  }
};

module.exports = function(message) {
  return new Promise(function(resolve, reject) {
    sendgrid.send(mapMessage(message), function(err, result) {
      if (err) return reject(err);
      resolve(result);
    });
  });
};