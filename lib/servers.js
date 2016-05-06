/**
 * For starting server eg. realtime-server, cloud-service-server
 * 
 * Return promise of http server
 */

var Promise = require("bluebird");

module.exports = function ($config, $logger, $build, $invoke) {
    //create http server
    var http = null;
    if ($config.https.enable) {
        var options = {
            key: $config.https.key,
            cert: $config.https.cert
        };
        http = require("https").createServer(options);
    } else {
        http = require("http").createServer();
    }

    function resolveHttpParameter(parameter) {
        if (parameter == "http") {
            return http;
        } else {
            return null;
        }
    }

    return new Promise(function (resolve, reject) {
        Promise.resolve($invoke(require("../lib/resource-server.js"), null, resolveHttpParameter))
                .then(function () {
                    if ($config.applicationMode == "app" || $config.applicationMode == "full") {
                        var controllerLoader = $build(require("../lib/controller-loader.js"));

                        require("../start/controllers.js").forEach(function (filePath) {
                            controllerLoader.load(filePath);
                        });

                        $invoke(require("../lib/dispatch-stanza.js"), null, function (parameter) {
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
                        retVal = $invoke(require("../lib/realtime-server.js"), null, resolveHttpParameter);
                    } else {
                        $logger.info("Starting cloud-service-server ...");
                        retVal = $invoke(require("../lib/cloud-service-server.js"), null, resolveHttpParameter);
                    }
                    return retVal;
                })
                .then(function () {
                    var port = $config.applicationMode == "service" ? $config.servicePort : $config.port;
                    http.listen(port, $config.host, function (error) {
                        if (error) {
                            reject(new Error("Start http server fail, port: " + port + ". Reason: " + error));
                        } else {
                            resolve(http);
                        }
                    });
                })
                .catch(function (err) {
                    reject(err);
                });

    });
};