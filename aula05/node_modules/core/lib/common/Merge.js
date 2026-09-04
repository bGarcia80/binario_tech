var Types = require('./Types.js').Types;

var Merge = function () {
    var dest = Array.prototype.shift.call(arguments),
        lastElement = arguments[arguments.length -1],
        recursive = false,
        i,
        l,
        key;

    if (Types.isBoolean(lastElement)) {
        recursive = Array.prototype.pop.call(arguments);
    }

    for (i = 0, l = arguments.length; i < l; i++) {
        for (key in arguments[i]) {
            if (Types.isObject(arguments[i][key]) && recursive) {
                if (!dest.hasOwnProperty(key)) {
                    dest[key] = {};
                }

                dest[key] = Merge(dest[key], arguments[i][key], recursive);
            } else {
                dest[key] = arguments[i][key];
            }
        }
    }

    return dest;
};

exports.Merge = Merge;
