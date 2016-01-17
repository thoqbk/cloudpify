/* 
 * Invoke remote services
 */

var httpClient = require("http");

var Q = require("q");

var _ = require("underscore");

var remoteServiceHost = null;
var remoteServicePort = null;


var $logger2 = null;

module.exports = function ($config, $logger, $registerFx) {

    $logger2 = $logger;

    //constructor promise
    var retVal = Q.defer();

    remoteServiceHost = $config.remoteService.host;
    remoteServicePort = $config.remoteService.port;

    $logger.info("Initialize cloud-service-client, begin fetching available remote services");

    fetchServiceDefinitions()
            .then(function (serviceDefinitions) {
                $logger.info("Received all available remote services: " + JSON.stringify(serviceDefinitions));
                //validate service list
                var requiredRemoteServiceNames = $config.remoteService.names;
                var availableServiceNames = _(serviceDefinitions).keys();
                var nameOfMissingServices = _(requiredRemoteServiceNames).filter(function (serviceName) {
                    return availableServiceNames.indexOf(serviceName) == -1;
                });
                if (nameOfMissingServices.length > 0) {
                    var errorMessage = "Require service(s) " + nameOfMissingServices + " but not provided by remote server";
                    retVal.reject(new Error(errorMessage));
                    return;
                }
                //ELSE:
                var requiredServiceDefinitions = {};
                for (var serviceName in serviceDefinitions) {
                    if (_(requiredRemoteServiceNames).contains(serviceName)) {
                        requiredServiceDefinitions[serviceName] = serviceDefinitions[serviceName];
                    }
                }
                buildAndRegisterServiceProxies($registerFx, requiredServiceDefinitions);
                retVal.resolve();
            })
            .fail(function (error) {
                retVal.reject(error);
            });

    //return
    return retVal.promise;
};

function buildAndRegisterServiceProxies($registerFx, serviceDefinitions) {
    var retVal = [];
    for (var serviceName in serviceDefinitions) {
        var serviceDefinition = serviceDefinitions[serviceName];
        var serviceInstanceProxy = {};
        for (var method in serviceDefinition) {
            serviceInstanceProxy[method] = buildServiceMethodProxy(serviceName, method);
        }
        //replace local service by remote service proxy
        $registerFx(serviceName, serviceInstanceProxy);
        //debug
        $logger2.info("Register remote service proxy successful. Service name: " + serviceName);
    }
    return retVal;
}

function buildServiceMethodProxy(serviceName, method) {
    return function () {
        var serviceArgs = [];
        if (arguments != null) {
            for (var key in arguments) {
                serviceArgs.push(arguments[key]);
            }
        }
        return invokeRemoteService(serviceName, method, serviceArgs);
    };
}

function fetchServiceDefinitions() {
    return invokeRemoteService("serviceDefinitionService", "fetch", null);
}

function invokeRemoteService(serviceName, method, serviceArgs) {
    var retVal = Q.defer();
    var options = {
        hostname: remoteServiceHost,
        port: remoteServicePort,
        path: "/cloud-service",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var errorMessageTemplate = "Invalid response data when invoking remote method: "
            + serviceName + "." + method + ". Reason: ";
    var request = httpClient.request(options, function (response) {
        response.setEncoding("utf8");
        var responseInString = "";
        response.on("data", function (chunk) {
            responseInString += chunk;
        });
        response.on("end", function () {
            try {
                var responseInJson = JSON.parse(responseInString);
            } catch (error) {
                retVal.reject(new Error(errorMessageTemplate + error));
                console.log(responseInString);
                return;
            }
            //ELSE:
            if (responseInJson.type == "error") {
                retVal.reject(new Error(errorMessageTemplate + responseInJson.body));
                return;
            }
            //ELSE:
            retVal.resolve(responseInJson.body);
        });
    });
    request.on("error", function (error) {
        retVal.reject(new Error(errorMessageTemplate + error));
    });


    request.write(JSON.stringify({
        ns: "cloudchat:cloud-service:" + serviceName + ":" + method,
        stanza: "iq",
        type: "get",
        body: serviceArgs
    }));

    request.end();

    //return
    return retVal.promise;
}