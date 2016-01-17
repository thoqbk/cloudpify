/* 
 * Contain info of all remote service
 * This service will be initialized in cloud-service-server
 */

var Fx = require("./fx.js");

module.exports = ServiceDefinitionService;

function ServiceDefinitionService($config,$logger,$resolveFx) {

    var serviceNames = $config.remoteService.names;
    var serviceDefinitions = {};
    serviceNames.forEach(function (serviceName) {
        var serviceInstance = $resolveFx(serviceName);
        if (serviceInstance == null) {
            throw new Error("Service does not exist: " + serviceName);
        }
        serviceDefinitions[serviceName] = buildServiceDefinition(serviceInstance);
    });

    //DEBUG
    $logger.info("All available remote services: " + JSON.stringify(serviceDefinitions, null, 2));

    this.fetch = function () {
        return serviceDefinitions;
    };
}

function buildServiceDefinition(serviceInstance) {
    var retVal = {};
    var methodNames = Fx.getMethodNames(serviceInstance);
    methodNames.forEach(function (methodName) {
        var fx = serviceInstance[methodName];
        var parameters = Fx.extractParameters(fx);
        retVal[methodName] = parameters;
    });
    //return
    return retVal;
}