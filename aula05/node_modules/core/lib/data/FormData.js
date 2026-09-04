/**
 * @overview FormData
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var BinaryData = require("./BinaryData.js").BinaryData;

/**
 * FormData
 * @class FormData
 * @classdesc FormData
 * @extends BinaryData
 *
 * @requires BinaryData
 * @requires Types
 *
 * @param {BinaryData} binaryData
 * @return {FormData}
 */
var FormData = function () {
    BinaryData.call(this);

    this._boundary = null;
    this._length = 0;
    this._fields = {};
};

FormData.prototype = Object.create(BinaryData.prototype);

FormData.prototype.getBoundary = function () {
    return this._boundary;
};

FormData.prototype.addField = function (fieldName, fieldValue) {
    this._fields[fieldName] = {
        "fieldName": fieldName,
        "fieldValue": fieldValue
    };

    return this;
};

FormData.prototype.addFile = function (fieldName, fieldValue, fileName, fileType) {
    if (!this._boundary) {
        this._boundary = Math.random();
    }

    this._fields[fieldName] = {
        "fieldName": fieldName,
        "fieldValue": fieldValue,
        "fileName": fileName,
        "fileType": fileType ? fileType : "application/octet-stream"
    };

    return this;
};
/**
 * Serialize form data to Buffer
 * @throws NOT IMPLEMENTED
 * @method
 */
FormData.prototype.toBuffer = function () {
    var keys = Object.keys(this._fields),
        i = 0,
        l = keys.length;

    if (!this.getBoundary()) {
        var fields = "";

        for (; i < l; i++) {
            if (this._fields.hasOwnProperty(keys[i])) {
                fields += keys[i].toString() + "=" + this._fields[keys[i]] + "&";
            }
        }

        this.setData(new Buffer(fields), BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8);
    } else {
        var buf,
            len = 0,
            pos = [],
            bufs = [],
            tmplen = 0,
            ending;

        for (; i < l; i++) {
            buf = this._getFieldAsBuffer(this._fields[keys[i]]);
            pos.push(buf.length);
            bufs.push(buf);

            len += pos[i];
        }

        ending = "\r\n--" + this.getBoundary() + "--";
        buf = new Buffer(len + ending.length);

        for (i = 0; i < l; i++) {
            tmplen += pos[i - 1] ? pos[i - 1] : 0;
            bufs[i].copy(buf, tmplen);
        }

        buf.write(ending, len);

        this.setData(buf, BinaryData.Encoding.BINARY, BinaryData.CharacterEncoding.UTF8);
    }

    return BinaryData.prototype.toBuffer.call(this);
};

/**
 * Serialize form data to UTF8 string
 * @throws NOT IMPLEMENTED
 * @method
 */
FormData.prototype.toUTF8String = function () {
    throw("NOT IMPLEMENTED");
};

FormData.prototype._getFieldAsBuffer = function (field) {
    var buf = null,
        len = 0,
        str = "--" + this.getBoundary() + "\r\n";
    str += 'Content-Disposition: form-data; name="' + field.fieldName+ '"';

    if (field.fileName) {
        str += '; filename="' + field.fileName + '"' + "\r\n";
        str += 'Content-Type: ' + field.fileType;
    }

    str += "\r\n\r\n";

    if (field.fileName) {
        len = str.length + field.fieldValue.length;
        buf = new Buffer(len);
        buf.write(str);
        field.fieldValue.copy(buf, str.length);
    } else {
        str += field.fieldValue + "\r\n";
        buf = new Buffer(str);
    }

    return buf;
};

exports.FormData = FormData;
