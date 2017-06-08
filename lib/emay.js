/*!
 * Module dependencies
 */
const assert = require('assert');
const util = require('util');
const request = require('request');
const debug = require('debug')('loopback:connector:emay');

let emayer;

module.exports = EmayConnector;

function EmayConnector(settings){
  assert(typeof settings === 'object', 'cannot initialize EmayConnector without a settings object');

  let connector = this;

  let cdkey = this.cdkey = settings.cdkey;
  let password = this.password = settings.password;
  emayer = connector.emayer = new Emay();
}

/**
 * Initialize the  connector against the given data source
 *
 * @param {DataSource} dataSource The loopback-datasource-juggler dataSource
 * @param {Function} [callback] The callback function
 */
EmayConnector.initialize = function(dataSource, callback) {
  debug('Hi, Emay connector!')
  dataSource.connector = new EmayConnector(dataSource.settings);
  callback();
};

EmayConnector.prototype.DataAccessObject = Emay;

function Emay() {

}

/**
 * Send an sms with the given `options`.
 *
 * Example Options:
 *
 * {
 *   mobile: "13856814635", // receiver
 *   message: "Hello ✔", // message
 * }
 *
 *
 * @param {Object} options
 * @param {Function} callback Called after the sms is sent or the sending failed
 */

Emay.send = function(options, cb) {
  let dataSource = this.dataSource;
  let settings = dataSource && dataSource.settings;
  let connector = dataSource.connector;
  assert(connector, 'Cannot send sms without a connector!');
  assert(typeof options === 'object', ' send sms without a options object');
  assert(options.mobile, ' send sms without a options.mobile');
  assert(options.message, ' send sms without a options.message');

  if (debug.enabled || settings && settings.debug) {
    debug('Sending SMS:');
    debug('\t TO:%s', options.to);
    debug('\t TEXT:%s', options.text);
  }

  var form = {
    cdkey: this.cdkey,
    password: this.password,
    phone: options.mobile,
    message: options.message
  };
  request.get({
      url: 'http://hprpt2.eucp.b2m.cn:8080/sdkproxy/sendsms.action',
      params: form
  }, function (err, response, body) {
    if (debug.enabled || settings && settings.debug) {
      debug('Emay response:');
      debug('\t ', arguments);
    }
    if (err) {
        return cb && cb(err);
    }
    cb && cb(null, body);
  });
};

/**
 * Send an sms instance using `modelInstance.send()`.
 */

Emay.prototype.send = function(fn) {
  this.constructor.send(this, fn);
};

/**
 * Access the node smser object.
 */

EmayConnector.client =
EmayConnector.prototype.client =
Emay.client =
Emay.prototype.client = emayer;
