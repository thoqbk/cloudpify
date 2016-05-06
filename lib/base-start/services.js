/* 
 * For registering base services eg. Event
 */

var Event = require("../event.js");

var AnnotationScanner = require("../annotation-scanner.js");

var DbConnectionFactory = require("../db-connection-factory.js");

var Promise = require("bluebird");

var _ = require("underscore");

module.exports = function ($registerByClass, $register, $build, applicationMode) {

    //get application mode
    var $config = require("../../config/app.js");
    $config.applicationMode = applicationMode;
    $register("$config", $config);

    var log4js = require("log4js");
    log4js.configure($config.log);

    var $logger = log4js.getLogger($config.debug ? "app" : "production-app");
    if (!$config.debug) {
        $logger.setLevel(_($config.log.appenders)
                .findWhere({category: "production-app"})
                .level);
    } else {
        $logger.setLevel(_($config.log.appenders)
                .findWhere({category: "app"})
                .level);
    }

    $register("$logger", $logger);

    $registerByClass("$event", Event);
    $register("$dbConnectionFactory", $build(DbConnectionFactory));

    var directories = ["lib/service"];
    $config.scanDirectories.forEach(function (directory) {
        directories.push(directory);
    });
    var scanner = new AnnotationScanner();

    return new Promise(function (resolve, reject) {
        scanner.scan(directories)
                .then(function () {
                    var rootPath = "../../";
                    //all services
                    var serviceFilePaths = scanner.getFilesByAnnotation("Service");
                    serviceFilePaths.forEach(function (serviceFilePath) {
                        var serviceAnnotation = scanner.getAnnotation(serviceFilePath, "Service");
                        var ServiceClass = require(rootPath + serviceFilePath);
                        $registerByClass(serviceAnnotation.parameters["name"], ServiceClass);
                    });

                    resolve();
                })
                .catch(reject);
    });

};


