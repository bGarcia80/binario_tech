var Memcache = require('./Memcache.js').Memcache;
var assertions = require('../common/Assertions.js').Assertions;


var CFMemcache = function(options){
    Memcache.call(this, options);
    this._memory = {};
};

CFMemcache.prototype = Object.create(Memcache.prototype);


CFMemcache.prototype.get = function(key, callback){
    assertions.isString(key, Memcache.Exception.WRONG_TYPE);

    if (this._memory.hasOwnProperty(key)) {
        this._memory[key].callbacks.push(callback);
    } else {
        // dodaje klucz do memory
        this._memory[key] = {
            data: null,
            callbacks: [callback]
        };
        var that = this;

        Memcache.prototype.get.call(this, key, function(data) {
            that._memory[key].data = data;
            var callback = null;
            while (callback = that._memory[key].callbacks.shift()) {
                try {
                    callback(that._memory[key].data);
                } catch (ex){
                    console.warn('emerg', "CFMEMCACHE CALLBACK FAILED", ex.message);
                }
            }
            delete that._memory[key];
        });
    }
};

CFMemcache.prototype.set = function(key, value, callback, lifeTime, waitForReply){
    assertions.isString(key, Memcache.Exception.WRONG_TYPE);
    if(this._memory.hasOwnProperty(key)){
        this._memory[key].data = value;
    }
    Memcache.prototype.set.call(this, key, value, callback, lifeTime, waitForReply);
};

CFMemcache.prototype['delete'] = function(key, callback){
    assertions.isString(key, Memcache.Exception.WRONG_TYPE);
    if(this._memory.hasOwnProperty(key)){
        this._memory[key].data = null;
    }
    Memcache.prototype['delete'].call(this, key, callback);
};

exports.CFMemcache = CFMemcache;
