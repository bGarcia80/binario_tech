/**
 * @overview EventDispatcher
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

/**
 * EventDispatcher
 * @class EventDispatcher
 * @classdesc provides listening and dispatching events functionality
 * @returns {EventDispatcher}
 */
var EventDispatcher  = function(){
    this._eventsArray = {};
};

/**
 * Determines if there is an event listener for specified event type
 * @param {String} type
 * @method
 * @returns {Boolean}
 */
EventDispatcher.prototype.hasEventListener = function(type) {
    if (this._eventsArray.hasOwnProperty(type) && this._eventsArray[type].length > 0){
        return true;
    }
    return false;
};

/**
 * Adding listener for specified event
 * @param {String} type
 * @param {Function} callbackFunction
 * @param {Object} context
 * @param {Function} callbackFunction Function that will be called if event of givent type will ocurr.
 * @returns {EventDispatcher}
 * @method
 */
EventDispatcher.prototype.addEventListener = function(type, callbackFunction, context){
    //creating new listener object
    var listener = {};
    listener.callbackFunction = callbackFunction;
    listener.context = (context) ? context : this;
    //creating space for listeners of given type
    if (!this.hasEventListener(type)){
        this._eventsArray[type] = [];
    }

    //check if given listener is arledy added.
    for(var i = 0, l = this._eventsArray[type].length; i < l; i++){
        if(this._eventsArray[type][i].callbackFunction == callbackFunction && this._eventsArray[type][i].context == context){
            return false;
        }
    }

    //adding listener
    this._eventsArray[type].push(listener);

    return this;
};

/**
 * Dispatches event
 * @param {Event} e Event object to be dispatched
 * @returns {undefined}
 * @method
 */
EventDispatcher.prototype.dispatchEvent = function(e) {
    if (this.hasEventListener(e.type)) {
        //creating private function to pass listener by value otherwise nextTick oparates on last loop iteration variables states
        var callLater = function(listener) {
            //passing script execution to end of script execution queue
            //different in client "window.setTimeout"
            //process.nextTick( function(){
            //setTimeout( function(){
                listener.callbackFunction.call(listener.context, e);
            //}, 0);
        };
        //creating snapshot of current listener's list
        var snapshot = this._eventsArray[e.type].slice(0);
        //dispatching events
        for (var i = 0, max = snapshot.length; i < max; i++) {
            e.target = this;
            var listener = snapshot[i];
            if ( listener.callbackFunction){
                callLater(listener);
            } else{
                throw {stack: 'EventDispatcher/dispatchEvent', message: "Callback function for Event type: [ " + e.type + " ] is undefined. Please check your addEventListener statement."};
            }

            // if someone will remove listener i need to recalculate
            var newLength = snapshot.length;
            if (max != newLength) {
                var diff = max - snapshot.length;
                i = i - diff;
                max = newLength;
            }
        }
        //deleting snapshot
        //delete snapshot;
        snapshot = null;
    }
};

/**
 * Remove listener for specified event type
 * @param {String} type Event type
 * @param {Function} callbackFunction Function that was given on adding event listener.
 * @throws Listeners of given type: $$TYPE$$ do not exists.
 * @method
 * @returns {Boolean}
 */
EventDispatcher.prototype.removeEventListener = function(type, callbackFunction) {

    if (!this.hasEventListener(type)){
        throw 'Listeners of given type: "' + type + '" do not exists.';
    }

    var i = 0,
        length = this._eventsArray[type].length;

    while(i < length && this._eventsArray[type][i].callbackFunction != callbackFunction) {
        i++;
    }

    if(i < length){
        if(length > 1){
            this._eventsArray[type].splice(i, 1);
        } else {
            delete this._eventsArray[type];
        }
        return true;
    }
    return false;
};

/**
 * Remove group of listeners or all listeners
 * @param {String} type Event type if given removes all listeners of given type, otherwise removes all listeners.
 * @returns {Boolean}
 * @throws Listeners of given type: "' + type + '" do not exists
 * @method
 */
EventDispatcher.prototype.removeAllEventListeners = function(type) {
    if(type){
        if(this.hasEventListener(type)){
            delete this._eventsArray[type];
            return true;
        } else {
            throw 'Listeners of given type: "' + type + '" do not exists.';
        }
    } else {
        this._eventsArray = {};
        return true;
    }
};

exports.EventDispatcher = EventDispatcher;
