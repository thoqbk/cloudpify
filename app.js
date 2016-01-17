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

var log4js = require("log4js");
log4js.configure("config/log4js.json");
var $logger = log4js.getLogger("app");
container.register("$logger", $logger);

//get application mode
var $config = require("./config/app.js");
var applicationMode = "full";//app+service
process.argv.forEach(function (val) {
    if (val == "mode=service") {
        applicationMode = "service";
    }
    if (val == "mode=app") {
        applicationMode = "app";
    }
});
$config.applicationMode = applicationMode;
container.register("$config", $config);

$logger.info("-----");
$logger.info("Starting Cloudsify (c) 2015 Cloudsify.io");
$logger.info("Application mode: " + applicationMode);

//Start order:
//1. base-services
//2. services
//3. servers
//4. events
//5. print out startus

Q(container.invoke(require("./lib/base-start/services.js")))
        .then(function () {
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
            var appName = $config.applicationMode == "full" ? "Cloudsify" : ($config.applicationMode == "service" ? "Cloudchat-service" : "Cloudchat-app");
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