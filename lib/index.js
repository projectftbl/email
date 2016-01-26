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

var buildMessage = function(user, subject, text, html) {
  return {
    subject: subject
  , text: text
  , html: html
  , from_email: configuration('email:from')
  , from_name: configuration('email:name')
  , to: [{ email: user.email, name: user.name }]
  , headers: { 'Reply-To': configuration('email:reply') }
  };
};

Emailer.prototype.send = function(user, subject, text, force) {
  if (!user.allowEmails && !force) return Promise.cast();

  return this.sender(buildMessage(user, subject, text));
};

Emailer.prototype.sendUsingTemplate = Promise.method(function(user, name, data, force) {
  var that = this;

  if ((!user.settings.allowEmails && !force) || !user.email) return;

  _.assign(data, { host: data.host || configuration('host'), user: user });

  return that.compile(name + '.subject', data).then(function(subject) {
    return that.compile(name + '.body', data).then(function(body) {
      if (body == null) return; // No template
      return that.sender(buildMessage(user, subject, null, body));    
    });
  });
});

module.exports = Emailer;