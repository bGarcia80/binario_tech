/**
 * @overview Compressor
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Types = require("../common/Types.js");
var compress = require('compress-buffer').compress;
var uncompress = require('compress-buffer').uncompress;

/**
 * Compressor
 * @class Compressor
 * @classdesc Compressor
 * 
 * @requires Types
 * @requires compress-buffer
 * 
 * @param {Object} configuration
 * @return {Compressor}
 */
var Compressor = function(configuration){
    this._configuration = configuration;
};

/**
 * Compress data
 * @param {Buffer} data
 * @param {Function} callback
 * @param {Number} compressLevel
 * 
 * @method
 * @return {undefined}
 */
Compressor.prototype.compress = function(data, callback, compressLevel){
    compressLevel = compressLevel || 6;
    var compressedData = compress(data, compressLevel);
    callback(
        compressedData,
        this._getCompressionRate(data.length, compressedData.length)
    );
};

/**
 * Uncompress data
 * @param {Buffer} data
 * @param {Function} callback
 * 
 * @method
 * @return {undefined}
 */
Compressor.prototype.uncompress = function(data, callback){
    var compressedData = uncompress(data);
    callback(
        compressedData,
        this._getCompressionRate(data.length, compressedData.length)
    );
}

/**
 * Uncompress data
 * @param {Number} unCompressedLength
 * @param {Number} compressedLength
 * 
 * @method
 * @return {Object} in format: {times:Number, percentage:Number, compressedLength:Number, unCompressedLength:Number}
 * @private
 */
Compressor.prototype._getCompressionRate = function(unCompressedLength, compressedLength){
    return {
        times: Math.round(unCompressedLength/compressedLength),
        percentage: Math.round((100-(100*(compressedLength/unCompressedLength)))),
        compressedLength: compressedLength,
        unCompressedLength: unCompressedLength
    };        
};


exports.Compressor = Compressor;    
