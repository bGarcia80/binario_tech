var EmptyLogger = require('./EmptyLogger.js').EmptyLogger;
var Types = require('../common/Types.js').Types;
var stacktrace = require('stacktrace');

var WildFireLogger = function () {
    this._logs = [];
};

WildFireLogger.prototype = Object.create(EmptyLogger.prototype);

WildFireLogger.prototype._log = function (type, log, label) {
    var file = '', line = '';
    
    if (type == 'error') {
        var stack = stacktrace.getStack(3)[2];
        line = stack.lineNumber;
        file = stack.scriptName;
    }
    
    var msg = [{
        "Type":  type,
        "Label": label || '',
        "File":  file,
        "Line":  line
    }, log];
    this._logs.push(msg);
};

WildFireLogger.prototype.attach = function (request) {
    request.setHeader(WildFireLogger.HEADER_IN, "0.7.1", true);
};
WildFireLogger.prototype.append = function (response) {
    var headers = Object.keys(WildFireLogger.HEADERS_OUT);
    var x, max;
    for (x = 0, max = headers.length; x < max; x++) {
        response.setHeader(headers[x], WildFireLogger.HEADERS_OUT[headers[x]], true);
    }

    //numer naglowka wildfire
    var count = 0;
    //numer czesci wiadomosci
    var part = 0;
    //wiadomosc do wyslania
    var msg = '';
    //zakonczenie linii
    var lineEnding = "|";
    //tymczasowe zmienne do przeliczenia na ile naglowkow podzielic wiadomosc
    var data;
    var dataLength;
    var dataToSend;

    for (x = 0, max = this._logs.length; x < max; x++) {
        part = 0;
        msg = this._encodeMessage(this._logs[x]);

        while (msg.length > 0) {
            data = msg;
            dataLength = data.length;
            lineEnding = "|";

            if (msg.length > 5000) {
                lineEnding = "|\\";
                data = msg.substring(0, 4999);
                msg = msg.substring(4999, msg.length);
                part++;
            } else {
                msg = "";
                part++;
            }

            count++;
            if (part == 1) {
                dataToSend = dataLength + '|' + data + lineEnding;
            } else {
                dataToSend = '|' + data + lineEnding;
            }
            
            response.setHeader(WildFireLogger.HEADER_PREFIX + count, dataToSend);
        }
    }
};

WildFireLogger.prototype._encodeMessage = function (message) {
    var msg = '';
    var charCode;
    
    message = Types.isString(message) ? message : JSON.stringify(message);

    for (var i = 0; i < message.length; i++) {
        charCode = message.charCodeAt(i);
        if (charCode > 127) {
            msg += "\\u" + this._padEncoding(charCode.toString(16));
        } else {
            msg += message[i];
        }
    }

    return msg;
};

WildFireLogger.prototype._padEncoding = function (str) {
    var result = "00" + str;
    return result.substr(result.length - 4);
};

WildFireLogger.prototype.parse = function (headers, label) {
    var headersKeys = Object.keys(headers),
        i = 0,
        l = headersKeys.length,
        msg = "",
        wfMessage,
        header;

    for (; i < l; i++) {
        if (headersKeys[i].match(WildFireLogger.REGEXP)) {
            header = headers[headersKeys[i]][0];
            var start = header.indexOf('|');
            var end = header.lastIndexOf('|');
            wfMessage = [
                header.substring(0, start),
                header.substring(start+1, end),
                header.substring(end+1, header.length)
            ];
            msg += wfMessage[1];
            
            if (wfMessage[2] != "\\") {
                try {
                  msg = JSON.parse(msg);
                  if (label) {
                      if(msg[0].hasOwnProperty('Label')) {
                          msg[0].Label = label + ' ' + msg[0].Label;
                      } else {
                          msg[0].Label = label + ': ';
                      }
                  }
                  this._logs.push(msg);
                } catch (exx) {
                  console.warn('WILDFIRELogger. parse json error', msg);
                }
                msg = "";
            }
            
            delete headers[headersKeys[i]];
        }
    }
    
    return headers;
};

WildFireLogger.prototype.log = function (msg, label) {
    this._log("log", msg, label);
};
WildFireLogger.prototype.info = function (msg, label) {
    this._log("info", msg, label);
};
WildFireLogger.prototype.warn = function (msg, label) {
    this._log("warn", msg, label);
};
WildFireLogger.prototype.error = function (msg, label) {
    this._log("error", msg, label);
};
WildFireLogger.prototype.trace = function (label) {
    var stack = stacktrace.getStack(12);
    stack.unshift();
    
    var trace = [];
    
    for (var i = 1, l = stack.length; i < l; i++) {
        trace.push({
            "file": stack[i].scriptName,
            "line": stack[i].lineNumber,
            "function": stack[i].functionName,
            "args": ["Arguments not supported"]
        });
    }

    var msg = {
        "Class": "",
        "Message": label || "",
        "File": stack[0].scriptName,
        "Line": stack[0].lineNumber,
        "Type": "",
        "Function": stack[0].functionName,
        "Trace": trace
    };
    
    this._log("trace", msg, label);
};

WildFireLogger.match = function (request) {
    return request.getHeader(WildFireLogger.HEADER_IN) !== null;
};

WildFireLogger.HEADERS_OUT = {
    'X-Wf-Protocol-1': 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2',
    'X-Wf-1-Plugin-1': 'http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.3',
    'X-Wf-1-Structure-1': 'http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1'
};
WildFireLogger.HEADER_IN = "X-FirePHP-Version";
WildFireLogger.HEADER_PREFIX = 'X-Wf-1-1-1-';
WildFireLogger.REGEXP = new RegExp(WildFireLogger.HEADER_PREFIX, "i");

exports.WildFireLogger = WildFireLogger;
