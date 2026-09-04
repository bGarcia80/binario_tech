
var Event = require('../event/Event.js').Event;
var EventDispatcher = require('../event/EventDispatcher.js').EventDispatcher;
/**
 * CredentialProvider
 * @class CredentialProvider credentials access object
 * @requires Event
 * @requires EventDispatcher
 */
var CredentialsProvider = function () {
    EventDispatcher.call(this);
    this._currentCredentials = null;
    if (arguments.length == 1) {
        this._currentCredentials = arguments[0];
    } else if (arguments.length > 0) {
        this._currentCredentials = arguments;   
    }
};

CredentialsProvider.prototype = Object.create(EventDispatcher.prototype);

CredentialsProvider.prototype.get = function (callback) {
    if (this._currentCredentials) {
        callback(null, this._currentCredentials);   
    } else {
        callback(CredentialsProvider.Error.ACCESS_ERROR, null);   
    }
};
CredentialsProvider.prototype.refresh = function () {
    //abstract
};
CredentialsProvider.prototype.destroy = function () {
    //abstract
};

CredentialsProvider.Event = {};

CredentialsProvider.Event.LOAD = "Credetials_loaded";
CredentialsProvider.Event.ERROR = "Credetials_load_error";
CredentialsProvider.Event.TIMEOUT = "Credetials_load_timeout";

CredentialsProvider.Error = {};
CredentialsProvider.Error.ACCESS_ERROR = "Unable to access credentials";

exports.CredentialsProvider = CredentialsProvider;