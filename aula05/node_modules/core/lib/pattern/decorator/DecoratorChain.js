/**
 * @overview DecoratorChain
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Event = require("../../event/Event.js").Event;
var ErrorEvent = require("../../event/ErrorEvent.js").ErrorEvent;
var EventDispatcher = require("../../event/EventDispatcher.js").EventDispatcher;
var AbstractDecorator = require("./AbstractDecorator.js").AbstractDecorator;

/**
 * Responsible for collecting decorators and request/response process execution.
 * @class DecoratorChain
 * @extends EventDispatcher
 * 
 * @requires Event
 * @requires ErrorEvent
 * @requires EventDispatcher
 * @requires AbstractDecorator
 * 
 * @returns {DecoratorChain}
 */
var DecoratorChain = function () {
    EventDispatcher.call(this);

    /**
     * Holds currently decorated object
     * @private
     */
    this._decoratedObject = null;

    /**
     * Holds decorator's method to invoke
     * @private
     */
    this._decoratorMethod = null;

    /**
     * Holds decorators
     * @private
     * @type Array
     */
    this._decorators = [];

    /**
     * Indicates decorator currently processing
     * @private
     */
    this._decorationProgress = 0;

    /**
     * Indicates current processing phase
     * @type {String} Posibble values are {@link DecoratorChain.PROCESSING} or {@link DecoratorChain.STOPPED}.
     */
    this.currentPhase = DecoratorChain.STOPPED;
};

DecoratorChain.prototype = Object.create(DecoratorChain.prototype);


/**
 * Adds decorator to the chain
 * @param {AbstractDecorator} decorator
 * @method
 * @returns {undefined}
 */
DecoratorChain.prototype.addDecorator = function (decorator) {
    this._checkDecoratorType(decorator);
    this._decorators.push(decorator);
    decorator.addEventListener(AbstractDecorator.COMPLETE,
                                this._handleDecorationComplete, this);
    decorator.addEventListener(AbstractDecorator.ERROR,
                                this._handleDecorationError, this);
};

/**
 * Removes decorator from the chain
 * @param {AbstractDecorator} decorator
 * @returns {AbstractDecorator} removed decorator or null if decorator wasn't found in chain. 
 * @method
 */
DecoratorChain.prototype.removeDecorator = function (decorator) {
    this._checkDecoratorType(decorator);
    var i = 0, count = this._decorators.length;
    while (i < count && this._decorators[i] != decorator) {
        i++;
    }
    if (i < count) {
        decorator.removeEventListener(AbstractDecorator.COMPLETE,
                                        this._handleDecorationComplete, this);
        return this._decorators.splice(i);
    }
    return null;
};

/**
 * Indicates if decorator is a part of a chain.
 * @param {AbstractDecorator} decorator
 * @returns {Boolean}
 * @method
 */
DecoratorChain.prototype.hasDecorator = function (decorator) {
    this._checkDecoratorType(decorator);
    var i = 0, count = this._decorators.length;
    while (i < count && this._decorators[i] != decorator) {
        i++;
        console.log(i < count, this._decorators[i] != decorator);
    }
    if (i < count) {
        return true;
    }
    return false;
};

/**
 * Execute decoration process
 * @param {Object} object
 * @param {String} methodName
 * @throws {DecoratorChain.Exeption.ALREADY_IN_PROGRESS}
 * @throws {DecoratorChain.Exeption.WRONG_PARAMS}
 * @returns {undefined}
 * @method
 */
DecoratorChain.prototype.decorate = function (object, methodName) {
    if (this.currentPhase == DecoratorChain.PROCESSING) {
        throw DecoratorChain.Exeption.ALREADY_IN_PROGRESS;
    }
    if (!object || !methodName) {
        throw DecoratorChain.Exeption.WRONG_PARAMS;
    }
    this.currentPhase = DecoratorChain.PROCESSING;
    this._decoratedObject = object;
    this._decoratorMethod = methodName;
    this._decorationProgress = 0;
    this._proceedDecoration();
};

/**
 * Checks if given decorator is an instance of AbstractDecorator class
 * @private
 * @param {AbstractDecorato} decorator
 * @throws {DecoratorChain.Exeption.WRONG_DECORATOR_TYPE}
 * @method
 */
DecoratorChain.prototype._checkDecoratorType = function (decorator) {
    if (!(decorator instanceof AbstractDecorator)) {
        throw DecoratorChain.Exeption.WRONG_DECORATOR_TYPE;
    }
};

 /**
  * Handles decorator COMPLETE event;
  * @private
  * @param {Event} e
  * @throws {DecoratorChain.Exeption.FATAL_PROCESSING_ERROR}
  * @method
  */
DecoratorChain.prototype._handleDecorationComplete = function (e) {
    //console.log("           -- DecoratorChain: completed decorator no: " + this._decorationProgress);
    if (this.currentPhase != DecoratorChain.PROCESSING) {
        throw DecoratorChain.Exeption.FATAL_PROCESSING_ERROR;
    }
    this._decorationProgress++;
    this._proceedDecoration();
};

 /**
  * Handles decorator ERROR event;
  * @private
  * @param {Event} e
  * @throws {DecoratorChain.Exeption.FATAL_PROCESSING_ERROR}
  * @fires DecoratorChain.Event.ERROR_DECORATOR_FAILED
  * @method
  */
DecoratorChain.prototype._handleDecorationError = function (e) {
    this.currentPhase = DecoratorChain.STOPPED;
    this.dispatchEvent(new ErrorEvent(
                                DecoratorChain.Event.ERROR_DECORATOR_FAILED, e,
                                -32500, "Decorator processing failed."));
};
 /**
  * Proceeding decoration of currently decorated object with current decorator.
  * @private
  * @fires DecoratorChain.Event.COMPLETE
  * @method
  * @returns {undefined}
  */
DecoratorChain.prototype._proceedDecoration = function () {
    //TODO timeout
    if (this._decorationProgress < this._decorators.length) {
        //console.log("           -- DecoratorChain: starting  decorator no: " + this._decorationProgress);
        this._decorators[this._decorationProgress][this._decoratorMethod](this._decoratedObject);
    } else {
        //console.log("           -- DecoratorChain: dispatching COMPLETE...");
        this.currentPhase = DecoratorChain.STOPPED;
        this.dispatchEvent(new Event(DecoratorChain.Event.COMPLETE, this._decoratedObject));
    }
};


/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
DecoratorChain.PROCESSING = "decoration_in_progress";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
DecoratorChain.STOPPED = "stopped";



/**
 * Namespace for event messages.
 * @static
 * @constant
 * @namespace
 */
DecoratorChain.Event = {};

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
DecoratorChain.Event.COMPLETE = "complete";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
DecoratorChain.Event.ERROR_DECORATOR_FAILED = "decorator_failed";


/**
 * Namespace for exeptions messages.
 * @static
 * @constant
 * @namespace
 */
DecoratorChain.Exeption = {};

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
DecoratorChain.Exeption.WRONG_DECORATOR_TYPE = "Given decorator must be AbstractDecorator type.";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
DecoratorChain.Exeption.FATAL_PROCESSING_ERROR = "Fatal error. Processing completion handler was invoket but execution was initialized properly";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
DecoratorChain.Exeption.ALREADY_IN_PROGRESS = "Decoration chain is already in progress";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
DecoratorChain.Exeption.WRONG_PARAMS = "DecoratorChain:Incorrect params.";


exports.DecoratorChain = DecoratorChain;
