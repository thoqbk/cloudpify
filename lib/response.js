/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 22:48 August 21, 2015
 */

module.exports = Response;

function Response(userService, sessionService) {

    var self = this;

    this.toOnlineFriends = function (userId, message, callback) {
        userService.find({onlineStatus: "online"})
                .then(function (users) {
                    users.forEach(function (user) {
                        if (user.id != userId) {
                            self.to(user.id, message, callback);
                        }
                    });
                });
    };

    this.to = function (userId, message, callback) {
        var channels = sessionService.getChannelsByUserId(userId);
        if (channels != null) {
            channels.forEach(function (channel) {
                channel.emit(message);
            });
            if (callback != null) {
                callback();
            }
        }
    };

    this.echo = function (channel, message, callback) {
        channel.emit(message);
        if (callback != null) {
            callback();
        }
    };
}
