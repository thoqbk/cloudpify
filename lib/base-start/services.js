/* 
 * For registering base services eg. Event
 */

var Event = require("../event.js");

var StringService = require("../service/string-service.js");

var SessionService = require("../session-service.js");

var AuthenticationService = require("../../service/authentication-service.js");

module.exports = function ($registerByClassFx, $registerFx) {

    var log4js = require("log4js");
    log4js.configure("./config/log4js.json");
    var $logger = log4js.getLogger("app");
    $registerFx("$logger", $logger);

    //get application mode
    var $config = require("../../config/app.js");
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
    $registerFx("$config", $config);

    $registerByClassFx("sessionService", SessionService);
    $registerByClassFx("stringService", StringService);
    $registerByClassFx("$event", Event);

    $registerByClassFx("authenticationService", AuthenticationService);
};


