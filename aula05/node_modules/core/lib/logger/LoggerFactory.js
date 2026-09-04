var EmptyLogger = require('./EmptyLogger.js').EmptyLogger;
var WildFireLogger = require('./WildFireLogger.js').WildFireLogger;

LoggerFactory = function () {};
LoggerFactory.getInstance = function (request) {
    var i = 0,
        l = LoggerFactory.LOGGERS.length;
        
    for (; i < l; i++) {
        if (LoggerFactory.LOGGERS[i].match(request)) {
            return LoggerFactory.LOGGERS[i];
        }
    }
    
    return null;
};

LoggerFactory.LOGGERS = [ WildFireLogger ];

exports.LoggerFactory = LoggerFactory;
