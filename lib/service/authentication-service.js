/**
 * The default implementation of authen service
 */

var Q = require("q");

var jwt = require('jsonwebtoken');

module.exports = AuthenticationService;

function AuthenticationService($resolveFx, $config, $logger) {
    //--------------------------------------------------------------------------
    //  Method binding

    var jwtOptions = {
        expiresIn: $config.channelAuthentication.jwt.expiresIn,
        algorithm: $config.channelAuthentication.jwt.algorithm
    };

    var userService = null;

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
                        jwt.verify(token, $config.channelAuthentication.jwt.secretKey, jwtOptions,
                                function (error, decoded) {
                                    if (error || decoded.data != userId) {
                                        retVal.resolve(false);
                                        //debug
                                        if (error != null) {
                                            $logger.debug("Verify token with jwt fail. UserId: " + userId + "; token: " + token + ". Reason: " + error);
                                        }
                                    } else {
                                        retVal.resolve(true);
                                    }
                                });
                    }
                })
                .catch(function (error) {
                    retVal.reject(error);
                });

        return retVal.promise;
    };

    this.generateToken = function (userId) {
        var retVal = Q.defer();
        isValidUserId(userId)
                .then(function (ok) {
                    if (ok) {
                        var token = jwt.sign({data: userId}, $config.channelAuthentication.jwt.secretKey, jwtOptions);
                        retVal.resolve(token);
                    } else {
                        retVal.reject(new Error("Invalid user: " + userId));
                    }
                })
                .catch(function (error) {
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
            if (userService == null) {
                userService = $resolveFx("userService");
            }
            if (userService == null) {
                throw new Error("AuthenticationService cannot work because of missing userService");
            }
            userService.get(userId)
                    .then(function (user) {
                        if (user == null) {
                            retVal.resolve(false);
                        } else {
                            retVal.resolve(true);
                            cachedUserIds[userId] = true;
                        }
                    })
                    .catch(function (error) {
                        retVal.reject(error);
                        //debug
                        $logger.debug("Error while getting user by id: " + userId + ". Reason: " + error);
                    });
        }
        return retVal.promise;
    }
}

