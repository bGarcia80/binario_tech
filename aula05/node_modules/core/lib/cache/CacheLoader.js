var Request = require('../http/Request.js').Request;
var Response = require('../http/Response.js').Response;
var Loader = require('../http/Loader.js').Loader;
var Memcached = require('../client/Memcached.js').Memcached;
var MemcachedSocket = require('../client/MemcachedSocket.js').MemcachedSocket;
var md5 = require('../crypto/Crypto.js').md5;
var Event = require('../event/Event.js').Event;
var ErrorEvent = require('../event/ErrorEvent.js').ErrorEvent;
var EventDispatcher = require('../event/EventDispatcher.js').EventDispatcher; 

var memcachedPool = null;
var storage = {};


var CacheLoader = function (request, options) {
    Loader.call(this, request);

    if (!memcachedPool) {
        memcachedPool = new Memcached(options);
    }

    this._prefix = {
        meta: "latest!headers!",
        body: "latest!body!"
    };
};

CacheLoader.prototype = Object.create(Loader.prototype);

CacheLoader.prototype.load = function (request, force) {

    var that = this,
        response = new Response(),
        cacheKey = this._getCacheKey(undefined, request);

    if (!force &&
            storage[cacheKey] &&
            storage[cacheKey][CacheLoader.Prefix.META] &&
            storage[cacheKey][CacheLoader.Prefix.BODY]) {

        var headersData = storage[cacheKey][CacheLoader.Prefix.META];

        response.setStatusCode(headersData.statusCode);
        response.setHeaders(headersData.headers);

        this.dispatchEvent(new Event(CacheLoader.Event.HEADERS, {
            "statusCode": headersData.statusCode,
            "headers": headersData.headers,
            "httpVersion": null,
            "body": null,
            "response": response,
            "expire": headersData.expire,
            "generating": headersData.generating,
            "generatingStarted": headersData.generatingStarted
        }));

        var bodyData = storage[cacheKey][CacheLoader.Prefix.BODY];
        response.write(bodyData);
        this.dispatchEvent(new Event(CacheLoader.Event.PROGRESS, bodyData));
        response.end();
        this.dispatchEvent(new Event(CacheLoader.Event.LOADED, response));

    } else {

        if (!storage.hasOwnProperty(cacheKey)) {
            storage[cacheKey] = {};
        }

        var headersKey = this._getMemcacheKey(CacheLoader.Prefix.META, request);

        var mSocketHeaders = memcachedPool.get(headersKey);

        mSocketHeaders.addEventListener(MemcachedSocket.Event.END, function (e) {
            if (e.data) {
                var headersData = JSON.parse(e.data);

                storage[cacheKey][CacheLoader.Prefix.META] = JSON.parse(e.data);

                response.setStatusCode(headersData.statusCode);
                response.setHeaders(headersData.headers);
                that.dispatchEvent(new Event(CacheLoader.Event.HEADERS, {
                    "statusCode": headersData.statusCode,
                    "headers": headersData.headers,
                    "httpVersion": null,
                    "body": null,
                    "response": response,
                    "expire": headersData.expire
                }));

                var bodyKey = that._getMemcacheKey(CacheLoader.Prefix.BODY, request);
                var mSocketBody = memcachedPool.get(bodyKey);
                mSocketBody.addEventListener(MemcachedSocket.Event.PROGRESS, function (e) {
                    response.write(e.data);
                    that.dispatchEvent(new Event(CacheLoader.Event.PROGRESS, e.data));
                });

                mSocketBody.addEventListener(MemcachedSocket.Event.END, function (e) {
                    response.end();
                    storage[cacheKey][CacheLoader.Prefix.BODY] = response.getBody().toBuffer();
                    that.dispatchEvent(new Event(CacheLoader.Event.LOADED, response));
                });
            } else {
                that.dispatchEvent(new Event(CacheLoader.Event.HEADERS, {
                    "statusCode": null,
                    "headers": null,
                    "httpVersion": null,
                    "body": null,
                    "response": null,
                    "expire": null
                }));
            }
        });
    }
};

CacheLoader.prototype.upload = function(request, response){
    var cacheKey = this._getCacheKey(undefined, request);

    if (!storage.hasOwnProperty(cacheKey)) {
        storage[cacheKey] = {};
    }

    var memcacheKeyHeaders = this._getMemcacheKey(CacheLoader.Prefix.META, request);
    var memcacheKeyBody = this._getMemcacheKey(CacheLoader.Prefix.BODY, request);

    //console.error('\nMEMCACHE KEYS: \n%s\n%s\n', memcacheKeyHeaders, memcacheKeyBody);

    var headersData = {
        url: request.getUrl(),
        headers: JSON.parse(JSON.stringify(response.getHeaders())),
        statusCode: response.getStatusCode(),
        expire: Date.now() + (response.getCacheTimeInSeconds() * 1000)
    };

    storage[cacheKey][CacheLoader.Prefix.META] = JSON.parse(JSON.stringify(headersData));

    var headersBuffer = new Buffer(JSON.stringify(headersData), 'utf8');

    var mSocketHeaders = memcachedPool.set(memcacheKeyHeaders, {
        lifetime: 0,
        length: headersBuffer.length,
        waitForReply: false
    });

    mSocketHeaders.write(headersBuffer);

    var mSocketBody = memcachedPool.set(memcacheKeyBody, {
        lifetime: 0,
        length: response.getHeader('content-length'),
        waitForReply: false
    });

    mSocketBody.addEventListener(MemcachedSocket.Event.END, function () {

    });

    response.addEventListener(Response.Event.WRITE, function (e) {
        mSocketBody.write(e.data);
    });

    response.addEventListener(Response.Event.END, function (e) {
        storage[cacheKey][CacheLoader.Prefix.BODY] = response.getBody().toBuffer();
    });

};

CacheLoader.prototype.generating = function(request){

    var cacheKey = this._getCacheKey(undefined, request);
    var memcacheKeyHeaders = this._getMemcacheKey(CacheLoader.Prefix.META, request);

    storage[cacheKey][CacheLoader.Prefix.META].generating = true;
    storage[cacheKey][CacheLoader.Prefix.META].generatingStarted = Date.now();

    var headersBuffer = new Buffer(JSON.stringify(storage[cacheKey][CacheLoader.Prefix.META]), 'utf8');
    var mSocketHeaders = memcachedPool.set(memcacheKeyHeaders, {
        lifetime: 0,
        length: headersBuffer.length,
        waitForReply: false
    });

    mSocketHeaders.write(headersBuffer);
};


CacheLoader.prototype['delete'] = function (request) {
    var cacheKey = this._getCacheKey(undefined, request);
    storage[cacheKey] = null;
    delete storage[cacheKey];

    var memcacheKeyHeaders = this._getMemcacheKey(CacheLoader.Prefix.META, request),
        memcacheKeyBody    = this._getMemcacheKey(CacheLoader.Prefix.BODY, request);
    memcachedPool['delete'](memcacheKeyHeaders);
    memcachedPool['delete'](memcacheKeyBody);
};


CacheLoader.prototype._getCacheKey = function (key, request) {
    return md5(request.getUrl());
};

CacheLoader.prototype._getMemcacheKey = function (key, request) {
    return this._prefix[key] + this._getCacheKey(key, request);
};


CacheLoader.Event = {};
CacheLoader.Event.HEADERS = "Loader_HEADERS";
CacheLoader.Event.PROGRESS = "Loader_PROGRESS";
CacheLoader.Event.LOADED = "Loader_LOADED";
CacheLoader.Event.ERROR = "Loader_ERROR";

CacheLoader.Prefix = {};
CacheLoader.Prefix.META = "meta";
CacheLoader.Prefix.BODY = "body";

exports.CacheLoader = CacheLoader;
