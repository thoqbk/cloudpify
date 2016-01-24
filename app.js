/* global __dirname */

/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Jul 22, 2015 11:27:37 PM
 *
 */

var startTime = (new Date()).getTime();

var Q = require("q");
var container = new (require("./lib/container.js"))();//service container

//Start order:
//1. base-services
//2. services
//3. servers
//4. events
//5. print out startus

Q(container.invoke(require("./lib/base-start/services.js")))
        .then(function () {
            $logger = container.resolve("$logger");   
            $config = container.resolve("$config");            
            
            $logger.info("-----");
            $logger.info("Starting Cloudpify (c) 2015 Cloudpify.io");
            $logger.info("Application mode: " + $config.applicationMode);
            return Q(container.invoke(require("./start/services.js")));
        })
        .then(function () {
            container.flushLazyServiceClasses();
        })
        .then(function () {
            $logger.info("Loading servers ...");
            return container.invoke(require("./lib/servers.js"));
        })
        //events:
        .then(function () {
            return Q(container.invoke(require("./lib/base-start/events.js")));
        })
        .then(function () {
            $logger.info("Loading events ...");
            return container.invoke(require("./start/events.js"));
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
        })
        .fail(function (err) {
            $logger.info("Start cloudchat FAIL. Reason: " + err.stack);
            $logger.info("-----");
            process.exit(1);
        });