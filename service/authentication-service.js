/**
 * The default implementation of authen service
 */

var Q = require("q");

var jwt = require('jsonwebtoken');

module.exports = AuthenticationService;

function AuthenticationService(userService, $config, $logger) {
    //--------------------------------------------------------------------------
    //  Method binding

    var jwtOptions = {
        expiresIn: $config.jwt.expiresIn,
        algorithm: $config.jwt.algorithm
    };

    /**
     * Check authentication info
     * @param {type} userId
     * @param {type} token
     * @returns {Q@call;defer.promise}
     */
    this.check = function (userId, token) {
        var retVal = Q.defer();

        isValidUserId(userId)
                .then(function (ok) {
                    if (!ok) {
                        $logger.debug("User not found. Given Id: " + userId);
                        retVal.resolve(false);
                    } else {
                        if ($config.jwt.enableAuthentication) {

                            jwt.verify(token, $config.jwt.secretKey, jwtOptions,
                                    function (error, decoded) {
                                        if (error || decoded != userId) {
                                            retVal.resolve(false);
                                            //debug
                                            if (error != null) {
                                                $logger.debug("Verify token with jwt fail. UserId: " + userId + "; token: " + token + ". Reason: " + error);
                                            }
                                        } else {
                                            retVal.resolve(true);
                                        }
                                    });

                        } else {
                            retVal.resolve(true);
                        }
                    }
                })
                .fail(function (error) {
                    retVal.reject(error);
                });

        return retVal.promise;
    };

    this.generateToken = function (userId) {
        var retVal = Q.defer();
        isValidUserId(userId)
                .then(function (ok) {
                    if (ok) {
                        var token = jwt.sign(userId, $config.jwt.secretKey, jwtOptions);
                        retVal.resolve(token);
                    } else {
                        retVal.reject(new Error("Invalid user: " + userId));
                    }
                })
                .fail(function (error) {
                    retVal.reject(error);
                });

        //return
        return retVal.promise;
    };

    //--------------------------------------------------------------------------
    //  Utils

    var cachedUserIds = {};

    function isValidUserId(userId) {
        var retVal = Q.defer();
        if (cachedUserIds[userId] != null) {
            retVal.resolve(true);
        } else {
            userService.getById(userId)
                    .then(function (user) {
                        if (user == null) {
                            retVal.resolve(false);
                        } else {
                            retVal.resolve(true);
                            cachedUserIds[userId] = true;
                        }
                    })
                    .fail(function (error) {
                        retVal.reject(error);
                        //debug
                        $logger.debug("Error while getting user by id: " + userId + ". Reason: " + error);
                    });
        }
        return retVal.promise;
    }
}

