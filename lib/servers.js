/**
 * For starting server eg. realtime-server, cloud-service-server
 */

var Q = require("q");
var http = require("http").createServer();

module.exports = function ($config, $logger, $buildFx, $invokeFx) {
    var retVal = Q.defer();
    //create http server
    Q($invokeFx(require("../lib/resource-server.js"), null, resolveHttpParameter))
            .then(function () {
                if ($config.applicationMode == "app" || $config.applicationMode == "full") {
                    var controllerLoader = $buildFx(require("../lib/controller-loader.js"));

                    require("../start/controllers.js").forEach(function (filePath) {
                        controllerLoader.load(filePath);
                    });
                    
                    $invokeFx(require("../lib/dispatch-stanza.js"), null, function (parameter) {
                        if (parameter == "controllerLoader") {
                            return controllerLoader;
                        } else {
                            return null;
                        }
                    });
                }
            })
            .then(function () {
                var retVal;
                if ($config.applicationMode == "app" || $config.applicationMode == "full") {
                    $logger.info("Starting realtime-server ...");
                    retVal = $invokeFx(require("../lib/realtime-server.js"), null, resolveHttpParameter);
                } else {
                    $logger.info("Starting cloud-service-server ...");
                    retVal = $invokeFx(require("../lib/cloud-service-server.js"), null, resolveHttpParameter);
                }
                return retVal;
            })
            .then(function () {
                var port = $config.applicationMode == "service" ? $config.servicePort : $config.port;
                http.listen(port, "localhost", function (error) {
                    if (error) {
                        retVal.reject(new Error("Start http server fail, port: " + port + ". Reason: " + error));
                    } else {
                        retVal.resolve();
                    }
                });
            })
            .fail(function (err) {
                retVal.reject(err);
            });
    return retVal.promise;
};


function resolveHttpParameter(parameter) {
    if (parameter == "http") {
        return http;
    } else {
        return null;
    }
}