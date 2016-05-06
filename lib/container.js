/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 9, 2015 12:25:14 AM
 * 
 */

var Fx = require("./fx");

var _ = require("underscore");

module.exports = Container;

/**
 * IoC Container
 * 
 * IoC container services:
 * 
 *  $build
 *  $invoke
 *  $register
 *  $registerByClass
 *  $resolve
 *  
 * @returns {Container}
 */
function Container() {

    var lazyServiceClasses = {};// service classes that is not registered because of missing dependency

    var self = this;

    var nameNServiceMap = {
    };

    this.build = function (constructor, missingResolver) {
        var arguments = getArguments(constructor, missingResolver);
        checkNotNullArguments(constructor, arguments);
        return new (constructor.bind.apply(constructor, [null].concat(arguments)))();
    };

    this.invoke = function (fx, thisContext, missingResolver) {
        var arguments = getArguments(fx, missingResolver);
        checkNotNullArguments(fx, arguments);
        return fx.apply(thisContext, arguments);
    };

    this.register = function (name, service) {
        nameNServiceMap[name] = service;
    };

    this.registerByClass = function (name, serviceClass) {
        lazyServiceClasses[name] = serviceClass;
    };

    /**
     * 
     * @param {type} query array of service-names or single service name
     * @param {type} missingResolver
     * @returns {Array|service|ServiceProvider.nameNServiceMap|ServiceProvider.resolve.retVal}
     */
    this.resolve = function (query, missingResolver) {
        var retVal = null;
        if (query instanceof Array) {
            retVal = [];
            query.forEach(function (serviceName) {
                var service = nameNServiceMap[serviceName];
                if (service == null && missingResolver != null) {
                    service = resolveMissing(missingResolver, serviceName);
                }
                retVal.push(service);
            });
        } else {
            retVal = nameNServiceMap[query];
            if (retVal == null && missingResolver != null) {
                retVal = resolveMissing(missingResolver, query);
            }
        }
        //return
        return retVal;
    };

    this.flushLazyServiceClasses = function () {
        var finished = _(lazyServiceClasses).keys().length == 0;
        var remainingLazyServiceClasses = lazyServiceClasses;
        $logger = this.resolve("$logger");
        while (!finished) {
            finished = true;
            var newRemainingLazyServiceClasses = {};
            for (var name in remainingLazyServiceClasses) {
                var serviceClass = lazyServiceClasses[name];
                if (!tryRegisterClass(name, serviceClass)) {
                    newRemainingLazyServiceClasses[name] = serviceClass;
                } else {
                    finished = false;
                    $logger.info("Flush service " + name + " successfully");
                }
            }
            remainingLazyServiceClasses = newRemainingLazyServiceClasses;
        }
        if (_(remainingLazyServiceClasses).keys().length != 0) {
            var remainingServiceNames = _(remainingLazyServiceClasses).keys().join(", ");
            throw new Error("Cannot build service class(es): " + remainingServiceNames + " because of missing dependency(s)");
        }
        lazyServiceClasses = {};
    };

    function getArguments(fx, missingResolver) {
        var parameters = Fx.extractParameters(fx);
        return self.resolve(parameters, missingResolver);
    }

    /**
     * 
     * @param {type} fx
     * @param {type} args
     * @returns {undefined}
     */
    function checkNotNullArguments(fx, args) {
        var nullIdx = _(args).findIndex(function (arg) {
            return arg == null;
        });
        if (nullIdx >= 0) {
            var parameters = Fx.extractParameters(fx);
            var message = "Found null parameter '" + parameters[nullIdx]
                    + "' in list of parameter(s): [" + parameters.join(", ") + "].\n"
                    + "Available service(s): [" + _(nameNServiceMap).keys().join(", ") + "]";
            throw new Error(message);
        }
    }

    function tryRegisterClass(name, serviceClass) {
        var retVal = false;
        var arguments = getArguments(serviceClass);
        try {
            checkNotNullArguments(serviceClass, arguments);
            self.register(name, self.build(serviceClass));
            retVal = true;
        } catch (error) {
        }
        return retVal;
    }

    function resolveMissing(missingResolver, serviceName) {
        if (typeof missingResolver === "function") {
            return missingResolver(serviceName);
        } else if (typeof missingResolver === "object") {
            return missingResolver[serviceName];
        } else {
            throw new Error("Invalid type of missintResolver: " + (typeof missingResolver));
        }
    }

    //register container function services:
    nameNServiceMap["$build"] = self.build;
    nameNServiceMap["$invoke"] = self.invoke;
    nameNServiceMap["$register"] = self.register;
    nameNServiceMap["$registerByClass"] = self.registerByClass;
    nameNServiceMap["$resolve"] = self.resolve;
}