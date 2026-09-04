var EmptyLogger = function () {};

EmptyLogger.prototype.attach = function () {};
EmptyLogger.prototype.append = function () {};
EmptyLogger.prototype.parse = function (obj) {
    return obj;
};

EmptyLogger.prototype.log = function () {};
EmptyLogger.prototype.info = function () {};
EmptyLogger.prototype.warn = function () {};
EmptyLogger.prototype.error = function () {};
EmptyLogger.prototype.trace = function () {};

exports.EmptyLogger = EmptyLogger;