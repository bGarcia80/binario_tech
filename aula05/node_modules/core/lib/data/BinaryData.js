/**
 * @overview BinaryData
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Types = require("../common/Types.js");
var Iconv = require('iconv').Iconv;

/**
 * Data 
 * @private
 * @class Data Private helper class. 
 */
var Data = function (data, encoding, characterEncoding) {
    this.encoding = encoding;
    this.characterEncoding = characterEncoding;
    this.data = data;        
};

/**
 * Converts data to encoding and characterEncoding
 * 
 * @method
 * @returns {}
 */
Data.prototype.convertTo = function (encoding, characterEncoding) {
    if (this.encoding != encoding || this.characterEncoding != characterEncoding) {
        //jesli aktualnie mamy base64 musimy to odczynic na chwile
        if (this.encoding == BinaryData.Encoding.BASE64) {
            this.data = new Buffer(this.data, 'base64');
            this.encoding = BinaryData.Encoding.BINARY;
        }
        //jesli zmieniamy kodowanie znaków
        if (characterEncoding && this.characterEncoding != characterEncoding) {
            this.data = (new Iconv(this.characterEncoding, characterEncoding)).convert(this.data);
            this.characterEncoding = characterEncoding;
            this.encoding = BinaryData.Encoding.BINARY;
        }
        //ustalamy ostateczny encoding
        if (this.encoding != encoding) {
            //jesli ma byc base64
            if (encoding == BinaryData.Encoding.BASE64) {
                this.data = this.data.toString('base64');
                this.encoding = BinaryData.Encoding.BASE64;
            }
            //jesli powinien byc TEXT
            else if (encoding == BinaryData.Encoding.TEXT) {
                //tylko jesli kodowanie jest UTF8
                if (this.characterEncoding == BinaryData.CharacterEncoding.UTF8) {
                    this.encoding = BinaryData.Encoding.TEXT;
                    //this.data = this.data.toString();
                }
                //jesli nie jest to mamy problem
                else {
                    throw BinaryData.Exception.CONVERTION_ERROR;
                }
            }
        }
    }
};


/**
 * BinaryData
 * @class BinaryData
 * @classdoc represents and holds binary data type. Allows to convert to and form diferent representations such as Base64 String or Buffer, also can conver String character encoding. 
 * @requires Types
 * @requires iconv
 * @requires base64
 * @param {String|Buffer} data
 * @param {String} encoding Determine what kind of output encoding will be expected, after calling toString, toBuffer methods 
 * @param {String} characterEncoding Determine what kind of output character encoding will be expected, after calling toString, toBuffer methods
 */ 
var BinaryData = function (data, encoding, characterEncoding) {
    this._encoding = encoding;
    this._characterEncoding = characterEncoding;
    this._data = null;
    this.setData(data, encoding, characterEncoding);
};

/**
 * Allows to set data in deferent representation (encoding and character encoding) 
 * @public
 * @param {String|Buffer} data 
 * @param {String} encoding {@see BinaryData.Encoding} current data encoding 
 * @param {String} characterEncoding {@see BinaryData.CharacterEncoding} current data character encoding                  
 */      
BinaryData.prototype.setData = function (data, encoding, characterEncoding) {
    this._data = new Data(data, encoding, characterEncoding);
};
/**
 * Returns current data byte length
 * @public     
 * @returns {Number} byte length    
 */      
BinaryData.prototype.length = function () {
    if (this._data) {
        //Potential problem maker if given buffer will have more space than content
        return this.toBuffer().length;
    }
};
/**
 * Returns expected character encoding
 * @public     
 * @returns {String} {@see BinaryData.CharacterEncoding}    
 */  
BinaryData.prototype.getCharacterEncoding = function () {
    return this._characterEncoding;
};
/**
 * Returns expected encoding
 * @public     
 * @returns {String} {@see BinaryData.Encoding}     
 */      
BinaryData.prototype.getEncoding = function () {
    return this._encoding;
};
/**
 * Returns data convertet to UTF8 string
 * @public
 * @returns {String} UTF8 string          
 */      
BinaryData.prototype.toUTF8String = function () {
    //TODO make not permanent convertion
    this._data.convertTo(BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8);
    return this._data.data.toString();   
}
/**
 * Retuns data convertet to safe string representation. If current data is Buffer which cannot be easly transformed to UTF8 representations, then data will be converted to Base64 representation. It works similar with deferent character encodings if desired encoding is ISO then returned string will be UTF8 Base64 converted string witch after decoding will be binary representation of ISO string.
 * @returns {String}      
 */      
BinaryData.prototype.toString = function () {
    var encoding = BinaryData.Encoding.TEXT;
    if (this.getEncoding() != BinaryData.Encoding.TEXT) {
        encoding = BinaryData.Encoding.BASE64;
    }
    this._data.convertTo(encoding, this.getCharacterEncoding())
    return this._data.data.toString();
};
/**
 * Returns data in Buffor representation. Character encoding will be converted if desired character encoding is deferent than seted data character encoding.
 * @returns {Buffer}     
 */      
BinaryData.prototype.toBuffer = function () {
    this._data.convertTo(this.getEncoding(), this.getCharacterEncoding());
    if (Buffer.isBuffer(this._data.data)) {
        return this._data.data;
    } else {
        return new Buffer(this._data.data, this.getEncoding());
    }
};


/**
 * Namespace for exeptions messages.
 * @static
 * @constant
 * @namespace
 */
BinaryData.Exception = {};

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
BinaryData.Exception.CONVERTION_ERROR = "CONVERTION_ERROR";


/**
 * Namespace for encoding types.
 * @static
 * @constant
 * @namespace
 */
BinaryData.Encoding = {};

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
BinaryData.Encoding.BINARY = "binary";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
BinaryData.Encoding.BASE64 = "base64";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
BinaryData.Encoding.TEXT   = "utf8";
// BinaryData.Encoding.ASCII  = "ascii";
// BinaryData.Encoding.UCS2   = "ucs2";
// BinaryData.Encoding.HEX   = "hex"; 

/**
 * Namespace for character encoding types.
 * @static
 * @constant
 * @namespace
 */
BinaryData.CharacterEncoding = {};

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
BinaryData.CharacterEncoding.UTF8 = "UTF-8";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
BinaryData.CharacterEncoding.ISO_8859_1  = "ISO-8859-1";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
BinaryData.CharacterEncoding.ISO_8859_2  = "ISO-8859-2";

exports.BinaryData = BinaryData;
