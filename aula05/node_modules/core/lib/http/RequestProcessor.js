var BinaryData = require("./../data/BinaryData.js").BinaryData;
var Request = require("./Request.js").Request;
var Response = require("./Response.js").Response;
var Types = require("../common/Types.js").Types;
var LoggerFactory = require("../logger/LoggerFactory.js").LoggerFactory;

var requestCounter = 0;


/**
 * @class RequestProcessor Base class for Request processor family.
 * @param {Server} server
 * @returns {RequestProcessor}
 */
var RequestProcessor = function (server) {
    this.server = server;
    this._request = null;
    this._response = null;
    this._host = null;

    this._timeStart = null;
    this._requestLine = null;
    this._referer = null;
    this._clientAddress = null;
    this._clientPort = null;
    this._userAgent = null;
    this._xforwardedfor = null;   
};


/**
 * Main processing method. Should be overloaded.
 */
RequestProcessor.prototype.process = function(request, response){

    this._request = request;
    this._response = response;

    // add http 1.1 keepalive stats reporting
    // this._attachKeepAliveStats(request, response);

    // access log line
    this._requestLine = '"' + request.getMethod() + ' ' + request.getPath() + request.getQueryString() + ' ' + request.getHttpVersion() + '"';

    this._referer = request.getHeader('referer');
    this._referer = this._referer ? '"' + this._referer + '"' : '"-"';

    this._userAgent = request.getHeader('user-agent');
    this._userAgent = this._userAgent ? '"' + this._userAgent + '"' : '"-"';

    this._clientAddress = request.getClientAddress();
    this._clientPort = request.getClientPort();

    this._xforwardedfor = request.getHeader('x-forwarded-for');
    this._xforwardedfor = this._xforwardedfor ? 'xff="' + this._xforwardedfor + '"' : '';

    response.addEventListener(Response.Event.SEND, this.sendAccessLog, this);

    this.createUniqueRequestId();
    var logger = LoggerFactory.getInstance(this._request);
    if (logger) {
        this._response.setLogger(new logger());
    }
};

RequestProcessor.prototype._attachKeepAliveStats = function (request, response) {
    var socket = response._httpServerResponse.socket;

    // keep alive pierwszy request
    // jezeli jeszcze nie ma listenera na socket close to go zapinamy
    if (socket) {
        if (socket.listeners('close').length == 1) {
            var date = + new Date();

            socket.stats = {
                // kiedy
                created: date,
                lastRequest: date,
                requestsCount: 1
            };

            socket.once('close', function () {
                console.info(
                    'ES/RESPONSE/CLOSE: tt=%s code=%s url=%s first_req_ts=%s req_count=%s socket_ttl=%s req_ttl=%s',
                    request.getProcessingTime(),
                    response.getStatusCode(),
                    request.getUrl(),
                    // http 1.1 keep-alive stats
                    // data kiedy wykonano pierwszy request na socket'cie
                    socket.stats.created,
                    // ilosc requestow na jednym requescie
                    socket.stats.requestsCount,
                    // ile zyl socket (od pierwszego requestu)
                    (+ new Date() - socket.stats.created),
                    // ile czasu wykorzystano na obsluge requestow
                    (socket.stats.lastRequest - socket.stats.created)
                );
            });
        } else {
            // keep alive kolejne requesty
            socket.stats.requestsCount += 1;
            socket.stats.lastRequest = + new Date();
        }
    }
};

RequestProcessor.prototype.getHost = function () {
    if (!this._host) {
        var host = this._request.getHeader('host');
        host = host ? host : this._request.getConnectionHost();
        if (typeof (host) != 'undefined' && host != null) {
            var hostPos = host.indexOf(":");
            if (hostPos != -1) {
                host = host.substring(0, hostPos);
            }
            this._host = host;
        } else {
            this._host = null;
        }
    }
    return this._host;
};
RequestProcessor.prototype.createUniqueRequestId = function () {
    //generuje request id
    var instanceId = process.env.NS_INSTANCE_ID || "UNKNOWN";

    this._request.setHeader('X-RID', ""
        + instanceId
        + "-" + requestCounter++
        + "-" + Date.now()
    );

    if (requestCounter >= Number.MAX_VALUE) {
        requestCounter = 0;
    }
};
RequestProcessor.prototype.sendAccessLog = function (e) {
    var responseCode = this._response.getStatusCode();
    var body = this._response.getBody();
    var responseSize = 0;
    if (Types.isInstanceOf(body, BinaryData)) {
        responseSize = body.length();
    }
    var requestTime = 'req_time=' + this._request.getProcessingTime() + 'ms';
    var host = (this.getHost() != 'undefined') ? this.getHost() : '-';
    var msg = [this._clientAddress, "-", "-", this._requestLine, host, responseCode, responseSize, this._referer, this._userAgent, requestTime, this._xforwardedfor].join(" ");
    console.info("access", msg);
};

exports.RequestProcessor = RequestProcessor;
