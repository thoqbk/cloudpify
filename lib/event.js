/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 22:58 August 5, 2015
 */

module.exports = Event;

function Event($logger) {

    var eventNameNFxsMap = {};

    this.listen = function (eventName, fx) {
        if (eventNameNFxsMap[eventName] == null) {
            eventNameNFxsMap[eventName] = [];
        }
        eventNameNFxsMap[eventName].push(fx);
        //debug
        $logger.debug("Register event listener successfully. Event name: " + eventName);
    };

    this.remove = function (eventName, fx) {
        if (eventNameNFxsMap[eventName] != null && eventNameNFxsMap[eventName].indexOf(fx) !== -1) {
            var index = eventNameNFxsMap[eventName].indexOf(fx);
            eventNameNFxsMap[eventName].splice(index, 1);
        }
    };
    
    this.has = function(eventName){
        return (eventNameNFxsMap[eventName] != null && eventNameNFxsMap[eventName].length > 0);
    };
    
    /**
     * Remove all listeners by event name
     * @param {type} eventName
     * @returns {undefined}
     */
    this.clear = function (eventName) {
        eventNameNFxsMap[eventName] = [];
    };

    this.fire = function () {
        var eventName = arguments[0];
        var fxs = eventNameNFxsMap[eventName];
        var fxArguments = Array.prototype.slice.call(arguments).slice(1);
        if (fxs != null) {
            fxs.forEach(function (fx) {
                fx.apply(null, fxArguments);
            });
        } else {
            $logger.debug("Not found event listener for event: " + eventName);
        }
    };
}
