/* 
 * For registering base events eg. auth event
 */

module.exports = function ($logger, $event, authenticationService) {
    $event.listen("auth", function (userId, token, socket, next) {
        authenticationService.check(userId, token)
                .then(function (ok) {
                    if (ok) {
                        next();
                    } else {
                        next(new Error("Authentication fail."));
                    }
                })
                .fail(function (error) {
                    next(new Error("Authentication fail."));
                    //debug
                    $logger.debug("Authentication fail, userId: " + userId + ", token: " + token + ". Reason: " + error);
                });
    });
};

