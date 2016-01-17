/* 
 * For registering base services eg. Event
 */

var Event = require("../event.js");

var Response = require("../response.js");

var StringService = require("../service/string-service.js");

var SessionService = require("../session-service.js");

var AuthenticationService = require("../../service/authentication-service.js");

module.exports = function ($registerByClassFx) {
    $registerByClassFx("sessionService", SessionService);
    $registerByClassFx("stringService", StringService);
    $registerByClassFx("$response", Response);
    $registerByClassFx("$event", Event);
    
    $registerByClassFx("authenticationService", AuthenticationService);
};


