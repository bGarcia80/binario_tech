var net = require('net');
var child_process = require('child_process');

//borrowed from cloud9/server/cloud9/netutil, copyright cloud9, ajax.org
var asyncRepeat = function (callback, onDone) {
    callback(function () {
        asyncRepeat(callback, onDone);
    }, onDone);
};

//borrowed from cloud9/server/cloud9/netutil, copyright cloud9, ajax.org
exports.findFreePort = function (start, end, hostname, callback) {
    var pivot = Math.floor(Math.random() * (end - start)) + start, port = pivot;
    asyncRepeat(function (next, done) {
        var stream = net.createConnection(port, hostname);

        stream.on("connect", function () {
            stream.destroy();
            port++;
            if (port > end) {
                port = start;
            }

            if (port == pivot) {
                done("Could not find free port.");
                return;
            }

            next();
        });

        stream.on("error", function () {
            done();
        });
    }, function (err) {
        callback(err, port);
    });
};

exports.getPidByPort = function (port, callback) {
    child_process.exec("netstat -nltp", function (error, stdout, stderr) {
        if (error) {
            callback(error);
            return;
        }
        var re = new RegExp(":" + port + ".*LISTEN +(\\d+)");
        var pid = re.exec(stdout);

        if (!pid) {
            callback(-2);
            return;
        }

        callback(null, parseInt(pid[1]));
    });
};
