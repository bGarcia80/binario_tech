var CredentialsProvider = require('../credentials/CredentialsProvider.js').CredentialsProvider;
var Memcache = require('../cache/CFMemcache.js').CFMemcache;
var MemcachedSocket = require('./MemcachedSocket.js').MemcachedSocket;
var Socket = require('../http/Socket.js').Socket;
var ConnectionPool = require('../http/ConnectionPool.js').ConnectionPool;

var instances = [];

var MemcacheAdapter = exports.MemcacheAdapter = function (cp) {
    return MemcacheAdapter.getInstance(cp);
};

MemcacheAdapter.prototype = {};

MemcacheAdapter.getInstance = function (credentialProviderInstance) {

    for (var i = 0, len = instances.length; i < len; i++) {
        if (instances[i][0] === credentialProviderInstance) {
            return instances[i][1];
        }
    }

    var instance = Object.create(MemcacheAdapter.prototype);
    instance._isReady = false;
    instance._queue = [];

    instance._options = {};
    instance._options.__proto__ = {
        poolSize: 10,
        getOptions: {
            chunkSize: 800 * 1024,
            timeout: 1000
        },
        setOptions: {
            chunkSize: 800 * 1024,
            lifetime: 3600,
            waitForReply: false
        },
        deleteOptions: {
            waitForReply: false
        }
    };
    
    instance._cp = credentialProviderInstance;
    instance._cp.addEventListener(CredentialsProvider.Event.LOAD, instance._onCredentialsLoaded, instance);
    instance._cp.addEventListener(CredentialsProvider.Event.ERROR, instance._onCredentialsError, instance);
    instance._cp.addEventListener(CredentialsProvider.Event.TIMEOUT, instance._onCredentialsTimeout, instance);
    instance._cp.get(function (error, data) {
        // TODO popprawic credential providera
        return;
        if (error) {
            instance._cp.refresh();
        } else {
            instance._onCredentialsLoaded({'data': data});
        }
    });

    instances.push([credentialProviderInstance,instance]);
    return instance;
};

MemcacheAdapter.prototype._onCredentialsLoaded = function (e) {
    var data = e.data
    /* mam tylko jeden host, jak bedzie wiecej to TODO */
    var connection = data.hosts[0];

    console.log('Memcached credentials loaded', connection);
    
    var connectionPool = new ConnectionPool({
        host: connection.host,
        port: connection.port,
        connections: data.connectionPool
    });
    
    this._client = new Memcache(connectionPool);
    
    // wykonuje to co bylo w kolejce (przed polaczeniem do memcachea na starcie)
    this._isReady = true;
    for(var i=0, max=this._queue.length; i<max; i++){
        this[this._queue[i].method].apply(this, this._queue[i].arguments);
    }
};


MemcacheAdapter.prototype._onCredentialsError = function (data) {
    console.error('Memcached credentials error', data);
//    this._cp.refresh();
};

MemcacheAdapter.prototype._onCredentialsTimeout = function (data) {
    console.log('Memcached credentials timeout', data);
//    this._cp.refresh();
};


MemcacheAdapter.prototype.get = function (key, opts, callback) {
    if(!this._isReady){
        this._queue.push({method: 'get', arguments: [key, opts, callback]});
        return;
    }
    this._client.get(key, function(data){
        callback(null, data);
    });
};

MemcacheAdapter.prototype.set = function (key, opts, callback) {
    //key, value, callback, lifeTime, waitForReply
    
    var options = opts;
    options.__proto__ = this._options.setOptions;
    
    this._client.set(
        key, 
        options.data, 
        function(err, data){
            callback(null, data);
        }, 
        options.lifetime, 
        options.waitForReply
    );
};


MemcacheAdapter.prototype['delete'] = function (key, opts, callback) {
    var options = opts || {};
    options.__proto__ = this._options.deleteOptions;
    this._client['delete'](key, callback);
    callback(null, null);
};


MemcacheAdapter.prototype.destroy = function () {
    this._cp.removeEventListener(CredentialsProvider.Event.LOAD, this._onCredentialsLoaded);
    this._cp.removeEventListener(CredentialsProvider.Event.ERROR, this._onCredentialsError);
    this._cp.removeEventListener(CredentialsProvider.Event.TIMEOUT, this._onCredentialsTimeout);
    if (this._poolInfoTimer) {
        clearTimeout(this._poolInfoTimer);
    }
};
