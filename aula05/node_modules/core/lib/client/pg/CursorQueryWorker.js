var Event = require('../../event/Event.js').Event;
var ErrorEvent = require('../../event/ErrorEvent.js').ErrorEvent;
var EventDispatcher = require('../../event/EventDispatcher.js').EventDispatcher;

var CursorQueryWorker = function (client) {
    EventDispatcher.call(this);
    this._client = client;
    this._transactionOpened = false;
};

CursorQueryWorker.prototype = Object.create(EventDispatcher.prototype);

CursorQueryWorker.prototype.query = function (sql, params, cursors) {
    var that = this;

    this.beginTransaction(function (data) {
        that._execute(sql, params, function (result) {
            if (result.rowCount == 0) {
                that.endTransaction(function () {
                    /* zwracam do klienta dane, który otrzymałem z procedury */
                    that._dispatchLoaded(result);
                });
            } else {
                var resultRow = result.rows[0];
                that._fetchCursors(resultRow, cursors, function () {
                    that.endTransaction(function () {
                        that._dispatchLoaded(result);
                    });
                });
            }
        });
    });
};

CursorQueryWorker.prototype._handleError = function (error) {
    var that = this;

    if (this._isFatalError.call(this, error)) { /* fatal - padło połączenie */
        this._dispatchError(error);
    } else if (this._transactionOpened) {       /* error ale mam otwartą transakcję */
        this.endTransaction(function (err, data) {
            return that._dispatchError(error);  /* oddaje wejściowy błąd */
        });
    } else {                                    /* nie fatal i zamknięta transakcja */
        this._dispatchError(error);
    }
};

CursorQueryWorker.prototype._dispatchError = function (err) {
    console.log('CursorQueryWorker:', 'dispatchError');
    this.dispatchEvent(new ErrorEvent(CursorQueryWorker.Event.ERROR, err));
};

CursorQueryWorker.prototype._dispatchLoaded = function (data) {
    console.log('CursorQueryWorker:', 'dispatchLoaded');
    this.dispatchEvent(new Event(CursorQueryWorker.Event.LOADED, data));
};

CursorQueryWorker.prototype.beginTransaction = function (callback) {
    var that = this;

    this._client.query('BEGIN', [], function (err, data) {
        that._transactionOpened = true;
        if (err) {
            return that._handleError(err);
        }

        return callback(data);
    });
};

CursorQueryWorker.prototype.endTransaction = function (callback) {
    var that = this;
    this._client.query("COMMIT", [], function (err, data) {
        that._transactionOpened = false;
        if (err) {
            return that._handleError(err);
        }

        return callback(data);
    });
};

CursorQueryWorker.prototype._execute = function (sql, params, callback) {
    var that = this;
    this._client.query(sql, params, function (err, data) {
        if (err) {
            return that._handleError(err);
        }

        return callback(data);
    });
};
CursorQueryWorker.prototype._getCursorMap = function (result, cursors) {
    var cursorsMap = [];

    for (var i = 0, len = cursors.length; i < len; i++) {
        var cursorField = cursors[i];
        cursorsMap.push({
            field: cursorField,
            cursor: result[cursorField]
        });
    }

    return cursorsMap;
};
CursorQueryWorker.prototype._fetchCursors = function (result, cursors, callback) {
    var that = this;

    /* no cursors to fetch */
    if (!cursors.length) {
        return callback(null);

    }
    var cursorsMap = this._getCursorMap(result, cursors);
    var counter = cursorsMap.length;

    var spawnFetchCursor = function (err) {
        if (err) {
            return that._handleError(err);
        }

        if (!counter) {
            /* w error musi być null */
            return callback(err);
        }

        /* decrementing counter */
        counter -= 1;
        return that._fetchCursor(cursorsMap[counter], result, spawnFetchCursor);
    };

    return spawnFetchCursor(null);
};

CursorQueryWorker.prototype._fetchCursor = function (map, result, callback) {
    console.log('PGPool:', 'fetching cursor', map);
    var that = this;
    var query = 'FETCH ALL FROM "' + map.cursor + '"';
    this._client.query(query, [], function (err, data) {
        if (err) {
            return callback(err);
        }
        /* replacing result field with data from cursor */
        result[map.field] = data.rows;
        return callback(err, data);
    });
};

CursorQueryWorker.prototype._isFatalError = function (err) {
    var PGPool = require('../PGPool.js').PGPool;
    return PGPool.prototype._isFatalError.call(this, err);
};

CursorQueryWorker.Event = {};
CursorQueryWorker.Event.LOADED = 'CursorQueryWorker_LOADED';
CursorQueryWorker.Event.ERROR = 'CursorQueryWorker_ERROR';
CursorQueryWorker.Event.FATAL_ERROR = 'CursorQueryWorker_FATAL_ERROR';

exports.CursorQueryWorker = CursorQueryWorker;