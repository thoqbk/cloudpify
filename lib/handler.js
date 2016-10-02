/**
 * Copyright (C) 2016, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Return handler providing start, stop cloudpify server
 *
 * Feb 14, 2016, <3 Do Hien
 */

var Promise = require("bluebird");

var Container = require("buncha").Container;

module.exports = function () {

    var httpServer = null;

    var clientSockets = {};

    var $logger = null;
    var $config = null;

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

        if (mode == null) {
            mode = "full";
        }

        if (["ready_for_start", "stopped", "start_failed"].indexOf(status) == -1) {
            throw new Error("Invalid status for starting server: " + status);
        }
        validateMode(mode);

        var startTime = (new Date()).getTime();

        var container = new Container({scannedAnnotations: ["Service", "Controller"]});//service container

        //Start order:
        //1. base-services
        //2. services
        //3. servers
        //4. events
        //5. print out status
        status = "starting";

        return new Promise(function (resolve, reject) {
            Promise.resolve(container.invoke(require("./base-start/services.js"), null, {applicationMode: mode}))
                .then(function () {
                    $config = container.resolve("$config");
                    if ($config.watch) {
                        return container.watch($config.scanDirectories);
                    } else {
                        return container.scan($config.scanDirectories);
                    }
                })
                .then(function () {
                    $logger = container.resolve("$logger");

                    console.log("-----");
                    console.log("Starting " + $config.name + " (c) " + (new Date()).getFullYear());
                    console.log("Application mode: " + $config.applicationMode);
                    return Promise.resolve(container.invoke(require("../start/services.js")));
                })
                .then(function () {
                    if ($config.applicationMode == "app") {
                        //unregister all removeServices
                        $config.remoteService.names.forEach(function (remoteServiceName) {
                            container.unregister(remoteServiceName);
                        });
                        return container.invoke(require("./cloud-service-client.js"));
                    }
                })
                .then(function () {
                    console.log("Loading servers ...");
                    return container.invoke(require("./servers.js"));
                })
                //events:
                .then(function (server) {
                    httpServer = server;
                    registerClientSocketEvents(httpServer);
                    return Promise.resolve(container.invoke(require("./base-start/events.js")));
                })
                .then(function () {
                    console.log("Loading events ...");
                    return container.invoke(require("../start/events.js"));
                })
                .then(function () {
                    var now = new Date();
                    var nowInString = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
                    var appName = $config.applicationMode == "full" ? $config.name : ($config.applicationMode == "service" ? ($config.name + "-service") : ($config.name + "-app"));
                    console.log("Start " + appName + " successfully in " + (now.getTime() - startTime)
                        + "ms at port: " + ($config.applicationMode == "full" || $config.applicationMode == "app" ? $config.port : $config.servicePort)
                        + ". " + nowInString);
                    console.log("-----");
                    //update status
                    status = "started";

                    resolve();
                })
                .catch(function (err) {
                    console.log("Start cloudchat FAIL. Reason: " + err.stack);
                    console.log("-----");
                    //update status
                    status = "start_failed";

                    reject(err);
                });
        });
    };

    this.stop = function () {

        if (["started", "stop_failed"].indexOf(status)) {
            throw new Error("Invalid status for stopping server: " + status);
        }

        status = "stopping";

        console.log("Begin stop server ...");

        return new Promise(function (resolve) {
            httpServer.close(function () {
                status = "stopped";
                console.log("Stop server successfully");
                resolve();
            });

            for (var key in clientSockets) {
                clientSockets[key].destroy();
            }
        });
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
