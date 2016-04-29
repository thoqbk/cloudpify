/**
 * The default implementation of authen service
 */

var Promise = require("bluebird");

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

        return new Promise(function (resolve, reject) {
            isValidUserId(userId)
                    .then(function (ok) {
                        if (!ok) {
                            $logger.debug("User not found. Given Id: " + userId);
                            resolve(false);
                        } else {
                            jwt.verify(token, $config.channelAuthentication.jwt.secretKey, jwtOptions,
                                    function (error, decoded) {
                                        if (error || decoded.data != userId) {
                                            resolve(false);
                                            //debug
                                            if (error != null) {
                                                $logger.debug("Verify token with jwt fail. UserId: " + userId + "; token: " + token + ". Reason: " + error);
                                            }
                                        } else {
                                            resolve(true);
                                        }
                                    });
                        }
                    })
                    .catch(function (error) {
                        reject(error);
                    });
        });
    };

    this.generateToken = function (userId) {
        return new Promise(function (resolve, reject) {
            isValidUserId(userId)
                    .then(function (ok) {
                        if (ok) {
                            var token = jwt.sign({data: userId}, $config.channelAuthentication.jwt.secretKey, jwtOptions);
                            resolve(token);
                        } else {
                            reject(new Error("Invalid user: " + userId));
                        }
                    })
                    .catch(function (error) {
                        reject(error);
                    });
        });
    };

    //--------------------------------------------------------------------------
    //  Utils

    var cachedUserIds = {};

    function isValidUserId(userId) {
        return new Promise(function (resolve, reject) {
            if (cachedUserIds[userId] != null) {
                resolve(true);
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
                                resolve(false);
                            } else {
                                resolve(true);
                                cachedUserIds[userId] = true;
                            }
                        })
                        .catch(function (error) {
                            reject(error);
                            //debug
                            $logger.debug("Error while getting user by id: " + userId + ". Reason: " + error);
                        });
            }
        });
    }
}

