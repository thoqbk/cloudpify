/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Aug 05, 2015 11:43:22 PM
 *
 */

/**
 * 
 * @param {type} $event
 * @param {type} $logger
 * @param {type} $resolveFx
 * @param {type} userService
 * @param {type} $config
 * @returns {undefined}
 */
module.exports = function ($event, $logger, $resolveFx, userService, $config) {

    //register realtime server events if any:
    if ($config.applicationMode == "full" || $config.applicationMode == "app") {
        registerRealtimeServerEvents($event, $logger, $resolveFx, userService, $config);
    }
};

function registerRealtimeServerEvents($event, $logger) {
    $event.listen("user.go.online", function (userId) {
        $logger.debug("User has just login. UserId: " + userId);
    });

    $event.listen("user.go.offline", function (userId) {
        $logger.debug("User has just logout. UserId: " + userId);
    });

    $event.listen("channel.connection", function (channel) {
        $logger.debug("A new channel has just opened, userId: " + channel.getUserId());
    });
}