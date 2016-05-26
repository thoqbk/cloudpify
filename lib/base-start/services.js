/* 
 * For registering base services eg. Event
 */

var Event = require("../event.js");

var DbConnectionFactory = require("../db-connection-factory.js");

var _ = require("underscore");

module.exports = function ($registerByConstructor, $register, $construct, applicationMode) {

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

    $registerByConstructor("$event", Event);
    $register("$dbConnectionFactory", $construct(DbConnectionFactory));
};


