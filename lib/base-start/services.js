/* 
 * For registering base services eg. Event
 */

var Event = require("../event.js");

var StringService = require("../service/string-service.js");

var SessionService = require("../service/session-service.js");

var AuthenticationService = require("../service/authentication-service.js");

var Stanzas = require("../stanzas.js");

module.exports = function ($registerByClassFx, $registerFx, applicationMode) {

    var log4js = require("log4js");
    log4js.configure("./config/log4js.json");
    var $logger = log4js.getLogger("app");
    $registerFx("$logger", $logger);

    //get application mode
    var $config = require("../../config/app.js");
    $config.applicationMode = applicationMode;
    $registerFx("$config", $config);

    $registerByClassFx("sessionService", SessionService);
    $registerByClassFx("stringService", StringService);
    $registerByClassFx("$event", Event);

    $registerByClassFx("authenticationService", AuthenticationService);
    
    $registerFx("Stanzas", Stanzas);
};


