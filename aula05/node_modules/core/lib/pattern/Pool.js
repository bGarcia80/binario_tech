/**
 * @overview Pool
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */


/**
 * @class Pool
 * @classdoc Pool
 *
 * @return {Pool}
 */
var Pool = function () {
    this._spareObjects = [];
    this._knownObjects = [];
    this._markedForDeletion = [];
    this._waitingCallbacks = [];
    this._queued = 0;
    this._maxQueued = null;
};

Pool.prototype = {};

/**
 * Delete all pool objects
 * @method
 * @return {undefined}
 */
Pool.prototype.clear = function () {
    this._spareObjects = [];
};

/**
 * Returns poll objects count
 * @method
 * @return {Number}
 */
Pool.prototype.getSpareLength = function () {
    return this._spareObjects.length;
};

/**
 * Returns poll known count
 * @method
 * @return {Number}
 */
Pool.prototype.getKnownLength = function () {
    return this._knownObjects.length;
};

/**
 * Returns waiting clients count
 * @method
 * @return {Number}
 */
Pool.prototype.getWaitingLength = function () {
    return this._waitingCallbacks.length;
};

/**
 * Returns number of queued clients
 * @method
 * @return {Number}
 */
Pool.prototype.getQueued = function () {
    return this._queued;
};

/**
 * Set maximum number of queued requests for client
 * @method
 * @param {Number} count
 * @return {undefined}
 */
Pool.prototype.setMaxQueued = function (count) {
    this._maxQueued = count;
};

/**
 * Mark all known objects for delayed deletion
 * @method
 */
Pool.prototype.markForDeletion = function (object) {
    var obj, index;
    if (object == undefined) {
        while ((obj = this._knownObjects.pop()) != undefined) {
            if ((index = this._spareObjects.indexOf(obj)) > -1 ) {
                this._spareObjects.splice(index, 1);
            }
            this._markedForDeletion.push(obj);
        }
    } else {
        index = this._knownObjects.indexOf(object);
        if (index != -1) {
            this._knownObjects.splice(index, 1);
            index = this._spareObjects.indexOf(object);
            if (index != -1) {
                this._spareObjects.splice(index, 1);
            }
            this._markedForDeletion.push(object);
        }
    }
};

/**
 * Add object to pool
 * @param {Object} object
 * @return {undefined}
 * @method
 */
Pool.prototype.add = function (object) {
    this._knownObjects.push(object);
    this.release(object);
};

/**
 * Return object to pool
 * @param {Object} object
 * @method
 */
Pool.prototype.release = function (object) {
    if (this._markedForDeletion.length > 0) {
        var index;
        if ((index = this._markedForDeletion.indexOf(object)) > -1) {
            this._markedForDeletion.splice(index, 1);
            if (object.hasOwnProperty('destroy')) {
                object.destroy();
            }
            return;
        }
    }
    /* sprawdzam czy obiekt jest w puli - jesli nie to wychodze */
    if (this._knownObjects.indexOf(object) == -1) {
        return;
    }
    if (this._waitingCallbacks.length > 0) {
        var callback = this._waitingCallbacks.shift();
        callback(object);
        this._queued--;
    } else {
        this._spareObjects.push(object);
    }
};

/**
 * Get object from pool
 * @param {Function} cb Will call cb(object) when object is available
 * @return {undefined}
 * @method
 */
Pool.prototype.get = function (cb) {
    if (this._spareObjects.length > 0) {
        var object = this._spareObjects.shift();
        cb(object);
    } else {
        if (this._maxQueued != null && this._queued >= this._maxQueued) {
            cb(Pool.ERROR.MAX_QUEUED_REACHED);
            return;
        }
        this._queued++;
        this._waitingCallbacks.push(cb);
    }
};

/**
 * Get objects from pool selected by function
 *
 * @param {Function} fnc Function that will run with object
 * @return {Array} collection of objects
 */
Pool.prototype.getCollection = function (fnc) {
    var array = [];
    var object;

    for (var i = 0, max = this.getKnownLength(); i < max; i++) {
        object = this._knownObjects[i];
        if (fnc(object)) {
            array.push(object);
        }
    }

    return array;
};

Pool.ERROR = {};
Pool.ERROR.MAX_QUEUED_REACHED = 'POOL_MAX_QUEUED_REACHED';
exports.Pool = Pool;
