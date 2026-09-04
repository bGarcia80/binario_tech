var fs = require('fs');
var path = require('path');

/**
 * Checks if process of of given id exists
 */
exports.exists = function (pid, callback) {
    /* platform dependent ? */
    var prefix = '/proc';

    var process_path = path.join(prefix, String(pid));

    fs.stat(process_path, function (err, stats) {
        if (!err) {
            callback(true);
        } else {
            callback(false);
        }
    });
};
