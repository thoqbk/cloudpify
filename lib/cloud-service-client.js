/* 
 * Invoke remote services
 */

var httpClient = null;

var options = {
    path: "/cloud-service",
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    }
};

var Promise = require("bluebird");

var _ = require("underscore");


var $logger2 = null;

module.exports = function ($config, $logger, $register) {

    $logger2 = $logger;

    httpClient = require($config.https.enable ? "https" : "http");

    if ($config.https.enable) {
        options.requestCert = true;
        options.rejectUnauthorized = false;
    }

    options.hostname = $config.remoteService.host;
    options.port = $config.remoteService.port;

    //constructor promise
    $logger.info("Initialize cloud-service-client, begin fetching available remote services");

    return new Promise(function (resolve, reject) {
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
                        reject(new Error(errorMessage));
                        return;
                    }
                    //ELSE:
                    var requiredServiceDefinitions = {};
                    for (var serviceName in serviceDefinitions) {
                        if (_(requiredRemoteServiceNames).contains(serviceName)) {
                            requiredServiceDefinitions[serviceName] = serviceDefinitions[serviceName];
                        }
                    }
                    buildAndRegisterServiceProxies($register, requiredServiceDefinitions);
                    resolve();
                })
                .catch(function (error) {
                    reject(error);
                });
    });
};

function buildAndRegisterServiceProxies($register, serviceDefinitions) {
    var retVal = [];
    for (var serviceName in serviceDefinitions) {
        var serviceDefinition = serviceDefinitions[serviceName];
        var serviceInstanceProxy = {};
        for (var method in serviceDefinition) {
            serviceInstanceProxy[method] = buildServiceMethodProxy(serviceName, method);
        }
        //replace local service by remote service proxy
        $register(serviceName, serviceInstanceProxy);
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

    return new Promise(function (resolve, reject) {
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
                    reject(new Error(errorMessageTemplate + error));
                    console.log(responseInString);
                    return;
                }
                //ELSE:
                if (responseInJson.type == "error") {
                    reject(new Error(errorMessageTemplate + responseInJson.body));
                    return;
                }
                //ELSE:
                resolve(responseInJson.body);
            });
        });
        request.on("error", function (error) {
            reject(new Error(errorMessageTemplate + error));
        });


        request.write(JSON.stringify({
            action: "cloudchat:cloud-service:" + serviceName + ":" + method,
            type: "get",
            body: serviceArgs
        }));

        request.end();
    });
}