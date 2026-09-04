var ZLibStream = require('zlibstream').ZLibStream;

var data = new Buffer("1234567", 'utf8');

var zlib = new ZLibStream();
var compressedData = zlib.deflate(data);
console.log(compressedData);