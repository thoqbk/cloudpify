/* 
 * For registering base services eg. Event
 */

var Event = require("../event.js");

var StringService = require("../service/string-service.js");

var SessionService = require("../service/session-service.js");

var AuthenticationService = require("../service/authentication-service.js");

var Stanzas = require("../stanzas.js");

var _ = require("underscore");

module.exports = function ($registerByClassFx, $registerFx, applicationMode) {

    //get application mode
    var $config = require("../../config/app.js");
    $config.applicationMode = applicationMode;
    $registerFx("$config", $config);

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

    $registerFx("$logger", $logger);

    $registerByClassFx("sessionService", SessionService);
    $registerByClassFx("stringService", StringService);
    $registerByClassFx("$event", Event);

    $registerByClassFx("authenticationService", AuthenticationService);

    $registerFx("Stanzas", Stanzas);
};


