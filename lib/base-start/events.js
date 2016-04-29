/* 
 * For registering base events eg. auth event
 */


module.exports = function ($logger, $event, $config, authenticationService) {
    $event.listen("channel.auth", function (userId, token, socket, next) {
        if ($config.channelAuthentication.enable) {
            authenticationService.check(userId, token)
                    .then(function (ok) {
                        if (ok) {
                            next();
                        } else {
                            next(new Error("Authentication fail."));
                        }
                    })
                    .catch(function (error) {
                        next(new Error("Authentication fail."));
                        //debug
                        $logger.debug("Authentication fail, userId: " + userId + ", token: " + token + ". Reason: " + error);
                    });
        } else {
            next();
        }
    });
};

