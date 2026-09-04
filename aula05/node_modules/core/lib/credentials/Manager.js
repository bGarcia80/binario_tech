var Assertions = require('../common/Assertions.js').Assertions;
var Types = require('../common/Types.js').Types;

var EventDispatcher = require('../event/EventDispatcher.js').EventDispatcher;
var Event = require('../event/Event.js').Event;
var ErrorEvent = require('../event/ErrorEvent.js').ErrorEvent;

var Loader = require('../http/Loader.js').Loader;

var SingletonEnforcer = function(){};

var CredentialsManager = function (enforcer, appName) {
    EventDispatcher.call(this);

    this._credentials = {};
    this._jobs = {};
    Assertions.isInstanceOf(enforcer, SingletonEnforcer, CredentialsManager.Exception.SINGLETON);
    this._applicationName = appName;
};

CredentialsManager.prototype = Object.create(EventDispatcher.prototype);

CredentialsManager.prototype.addEventListener = function (eventName, key, callback, context) {
    return EventDispatcher.prototype.addEventListener.call(this, eventName + key, callback, context);
};

CredentialsManager.prototype.removeEventListener = function (eventName, key, callback) {
    return EventDispatcher.prototype.removeEventListener.call(this, eventName + key, callback);
};

CredentialsManager.prototype.getCredential = function (key) {
    if (this._credentials.hasOwnProperty(key)) {
        this.dispatchEvent(new Event(CredentialsManager.Event.LOADED + key, this._credentials[key]));
    } else {
        this.renewCredential(key);
    }
};

CredentialsManager.prototype.renewCredential = function (key) {
    var self = this;
    
    if (this._jobs.hasOwnProperty(key)) {
      return;
    }
    
    this._jobs[key] = true;
    var OpalRequest = require('dl').opal.OpalRequest;
    var OpalLoader = require('dl').opal.OpalLoader;

    (new OpalLoader(new OpalRequest({
        "url": "router.opaladmin.onetapi.pl",
        "method": "get_credentials",
        "params": {
            "ds_alias": key
        },
        "application": this._applicationName
    }))).addEventListener(OpalLoader.Event.JSON_RESPONSE, function(data){
        var rpc = data.data.getBody();

        if (rpc.isError()) {
            delete self._jobs[key];
            self.dispatchEvent(new ErrorEvent(CredentialsManager.Event.ERROR + key, rpc.getError()));
            return;
        }

        self._credentials[key] = rpc.getResult();
        delete self._jobs[key];
        self.dispatchEvent(new Event(CredentialsManager.Event.LOADED + key, self._credentials[key]));
    }).addEventListener(Loader.Event.ERROR, function(data){
        delete self._jobs[key];
        self.dispatchEvent(new ErrorEvent(CredentialsManager.Event.ERROR + key, data));
    }).load();
};

var factoryInstances = {};

CredentialsManager.factory = function (appName) {
    if (!Types.isString(appName)) {
        if (process.env['OPAL_IDENTITY']) {
            appName = process.env['OPAL_IDENTITY'];
        } else {
            appName = "edgeserver.edgeserver.onetapi.pl";
        }
    }

    if (factoryInstances.hasOwnProperty(appName)) {
        return factoryInstances[appName];
    }

    factoryInstances[appName] = new CredentialsManager(new SingletonEnforcer(), appName);
    return factoryInstances[appName];
};

CredentialsManager.Event = {};
CredentialsManager.Event.LOADED = 'CredentialsManager_LOADED_';
CredentialsManager.Event.ERROR = 'CredentialsManager_ERROR_';

CredentialsManager.Exception = {};
CredentialsManager.Exception.SINGLETON = "Singleton class, use factory() instead.";

exports.CredentialsManager = CredentialsManager;
