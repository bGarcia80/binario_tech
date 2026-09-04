    var Redis = require('../lib/client/Redis.js').Redis;
// var profiler = require('v8-profiler');
// profiler.startProfiling('redis');
// profiler.startProfiling('test');
// var CredentialsProvider = require('../lib/credentials/CredentialsProvider.js').CredentialsProvider;
var CredentialsProvider = require('../lib/credentials/CredentialsProvider.js').CredentialsProvider;
// var cred = new CredentialsProvider('watchlater-ro.redis.skvdb.onetapi.pl', 'watchlater-ro.redis.skvdb.onetapi.pl');
// profiler.stopProfiling('test');

var cred = new CredentialsProvider({
    db: 9,
    hosts: [{
        host: '10.177.53.43',
        port: 6379
    }, {
        host: '10.162.49.84',
        port: 6379
    },{
        host: '10.177.53.46',
        port: 6379
    }],
    // connections: 20
});

var redisClient = new Redis(cred);

redisClient.onReady(function () {
    console.log('====> REDIS CLIENT READY <====');
});

setTimeout(function () {
    console.log('=========update > reduce connections to 2==========');

    redisClient.hgetall('7da6f2eb-9212-4cf8-9591-8b940420f65c', function () {
        console.log(arguments);
    });

}, 2000);

//
// setTimeout(function() {
//     console.log('=========update -> add 127 && 127 && connection 3==========');
//     redisClient._onCredentialsChange(null, {
//         hosts: [{
//             host: 'localhost',
//             port: 6379
//         }, {
//             host: '127.0.0.1',
//             port: 6379
//         }, {
//             host: '127.0.0.1',
//             port: 6379
//         }],
//         connections: 3
//     });
//     // console.log(redisClient.getStats());
// }, 6000);
//
// setTimeout(function() {
//     console.log('=========update -> del 127 ==========');
//     redisClient._onCredentialsChange(null, {
//         hosts: [{
//             host: 'localhost',
//             port: 6379
//         }, {
//             host: '127.0.0.1',
//             port: 6379
//         }],
//         connections: 200
//     });
//
//     // console.log(redisClient.getStats());
// }, 8000);

setInterval(function () {
    console.log(redisClient.getStats(), '<<--');
    //	console.log(redisClient._pools);
    //	redisClient.set('test', new Date().getTime());
    //	redisClient.publish('test', new Date().getTime())
}, 1801);
