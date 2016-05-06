/* 
 * For registering base services eg. Event
 */

var Event = require("../event.js");

var StringService = require("../service/string-service.js");

var SessionService = require("../service/session-service.js");

var AuthenticationService = require("../service/authentication-service.js");

var Stanzas = require("../stanzas.js");

var DbConnectionFactory = require("../db-connection-factory.js");

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

    $registerByClass("sessionService", SessionService);
    $registerByClass("stringService", StringService);
    $registerByClass("$event", Event);

    $registerByClass("authenticationService", AuthenticationService);

    $register("Stanzas", Stanzas);

    $register("$dbConnectionFactory", $build(DbConnectionFactory));

};


