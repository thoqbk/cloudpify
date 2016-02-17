/**
 * Copyright (C) 2016, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Return handler providing start, stop cloudpify server
 * 
 * Feb 14, 2016, <3 Do Hien
 */

var Q = require("q");

module.exports = function () {

    var httpServer = null;

    var clientSockets = {};

    var $logger = null;

    /**
     * Available status:
     * 1. ready_for_start
     * 2. stopped
     * 3. stopping
     * 4. started
     * 5. starting
     * 6. stop_failed
     * 7. start_failed
     * 
     * @type String
     */
    var status = "ready_for_start";

    /**
     * 
     * @param {type} mode
     * @returns {undefined}
     */
    this.start = function (mode) {

        var retVal = Q.defer();

        if (mode == null) {
            mode = "full";
        }

        if (["ready_for_start", "stopped", "start_failed"].indexOf(status) == -1) {
            throw new Error("Invalid status for starting server: " + status);
        }
        validateMode(mode);

        var startTime = (new Date()).getTime();

        var container = new (require("./container.js"))();//service container



        //Start order:
        //1. base-services
        //2. services
        //3. servers
        //4. events
        //5. print out status
        status = "starting";
        Q(container.invoke(require("./base-start/services.js"), null, buildResolveApplicationModeFx(mode)))
                .then(function () {
                    $logger = container.resolve("$logger");
                    $config = container.resolve("$config");

                    $logger.info("-----");
                    $logger.info("Starting Cloudpify (c) 2015 Cloudpify.io");
                    $logger.info("Application mode: " + $config.applicationMode);
                    return Q(container.invoke(require("../start/services.js")));
                })
                .then(function () {
                    $config = container.resolve("$config");
                    if ($config.applicationMode == "app") {
                        return container.invoke(require("./cloud-service-client.js"));
                    }
                })
                .then(function () {
                    container.flushLazyServiceClasses();
                })
                .then(function () {
                    $logger.info("Loading servers ...");
                    return container.invoke(require("./servers.js"));
                })
                //events:
                .then(function (server) {
                    httpServer = server;
                    registerClientSocketEvents(httpServer);
                    return Q(container.invoke(require("./base-start/events.js")));
                })
                .then(function () {
                    $logger.info("Loading events ...");
                    return container.invoke(require("../start/events.js"));
                })
                .then(function () {
                    var $config = container.resolve("$config");
                    var $logger = container.resolve("$logger");
                    var now = new Date();
                    var nowInString = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
                    var appName = $config.applicationMode == "full" ? "Cloudpify" : ($config.applicationMode == "service" ? "Cloudchat-service" : "Cloudchat-app");
                    $logger.info("Start " + appName + " successfully in " + (now.getTime() - startTime)
                            + "ms at port: " + ($config.applicationMode == "full" || $config.applicationMode == "app" ? $config.port : $config.servicePort)
                            + ". " + nowInString);
                    $logger.info("-----");
                    //update status
                    status = "started";

                    retVal.resolve();
                })
                .fail(function (err) {
                    $logger.info("Start cloudchat FAIL. Reason: " + err.stack);
                    $logger.info("-----");
                    //update status
                    status = "start_failed";

                    retVal.reject(err);
                });

        //return
        return retVal.promise;
    };

    this.stop = function () {

        var retVal = Q.defer();

        if (["started", "stop_failed"].indexOf(status)) {
            throw new Error("Invalid status for stopping server: " + status);
        }

        status = "stopping";

        $logger.info("Begin stop server ...");

        httpServer.close(function () {
            status = "stopped";
            $logger.info("Stop server successfully");
            retVal.resolve();
        });

        for (var key in clientSockets) {
            clientSockets[key].destroy();
        }

        return retVal.promise;
    };

    this.getStatus = function () {
        return status;
    };

    function registerClientSocketEvents(httpServer) {
        httpServer.on("connection", function (socket) {
            var key = socket.remoteAddress + ":" + socket.remotePort;
            clientSockets[key] = socket;
            socket.on("close", function () {
                delete clientSockets[key];
            });
        });
    }

};

function validateMode(mode) {
    if (["app", "full", "service"].indexOf(mode) == -1) {
        throw new Error("Invalid application mode: " + mode);
    }
}

function buildResolveApplicationModeFx(mode) {
    return function (parameter) {
        if (parameter == "applicationMode") {
            return mode;
        }
    };
}
;