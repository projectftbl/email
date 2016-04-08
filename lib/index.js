var _ = require('lodash')
  , path = require('path')
  , Promise = require('bluebird')
  , log = require('@ftbl/log')
  , utils = require('@ftbl/utility')
  , configuration = require('@ftbl/configuration')
  , template = require('@ftbl/templates');

var Emailer = function(paths, provider) {
  if (this instanceof Emailer === false) return new Emailer(paths, provider);

  if (paths == null) paths = path.join(process.cwd() + '/lib/templates/email');
  if (provider == null) provider = configuration('provider:email') || 'null';

  this.sender = require('./' + provider);
  this.compile = template(paths);
};

var buildMessage = function(user, subject, text, html, replyTo) {
  var from = replyTo || { name: configuration('email:name'), email: configuration('email:from') };

  return {
    subject: subject
  , text: text
  , html: html
  , from_email: from.email || from
  , from_name: from.name
  , to: [{ email: user.email, name: user.name }]
  , headers: { 'Reply-To': from.email || configuration('email:reply') }
  };
};

Emailer.prototype.send = Promise.method(function(user, subject, text, replyTo, force) {
  if (!user.allowEmails && !force) return;

  return this.sender(buildMessage(user, subject, text, null, replyTo));
});

Emailer.prototype.sendUsingTemplate = Promise.method(function(user, name, data, force) {
  var that = this;

  if ((!user.settings.allowEmails && !force) || !user.email) return;

  _.assign(data, { host: data.host || configuration('host'), user: user });

  return that.compile(name + '.subject', data).then(function(subject) {
    return that.compile(name + '.body', data).then(function(body) {
      if (body == null) return; // No template
      return that.sender(buildMessage(user, subject, null, body, data.replyTo));    
    });
  });
});

module.exports = Emailer;