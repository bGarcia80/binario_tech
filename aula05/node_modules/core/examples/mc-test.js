    var Memcached = require('./lib/client/Memcached.js').Memcached;
    var MemcachedSocket = require('./lib/client/MemcachedSocket.js').MemcachedSocket;
     
    var m = new Memcached({port: 11211, host: 'localhost'});
    var s = m.set("eloszka", {
        lifetime: 100,
        length: 100000,
        waitForReply: false
    });
     
    if (s.state != MemcachedSocket.State.READY) {
        s.addEventListener(MemcachedSocket.Event.READY, function () {
            console.log("SET EEVENT READY");
            for (var i = 0; i < 10000; i++) {
              s.write(new Buffer("0123456789"));
            }
        });
    } else {
            console.log("SET STATE READY");
            for (var i = 0; i < 10000; i++) {
              s.write(new Buffer("0123456789"));
            }
    }
     
    s.addEventListener(MemcachedSocket.Event.END, function () {
        console.log("SET EVENT END");
     
        var g = m.get("eloszka");
        if (g.state != MemcachedSocket.State.READY) {
            g.addEventListener(MemcachedSocket.Event.READY, function () {
                console.log("GET EVENT READY");
            });
        } else {
            console.log("GET STATE READY");
        }
     
        g.addEventListener(MemcachedSocket.Event.PROGRESS, function () {
            console.log("GET PROGRESS", arguments[0].data.toString().length);
        });
     
        g.addEventListener(MemcachedSocket.Event.END, function () {
            console.log("GET END", arguments[0].data.toString().length);
        });
    });
