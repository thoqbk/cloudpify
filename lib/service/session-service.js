/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Aug 04, 2015 12:04:22 AM
 *
 */
module.exports = SessionService;

function SessionService($event, $config, $logger) {

    var self = this;

    var userIdNOuttimeMap = {};//watch session

    var channelNUserIdMap = {};
    var channelNDeviceIdMap = {};
    var userIdNChannelsMap = {};
    var userIdNSessionDataMap = {};

    this.map = function (channel, userId, deviceId) {


        switch (channel.getType()) {
            case "socket.io":
            {
                $logger.debug("Map: userId: " + userId);

                channelNUserIdMap[channel.getId()] = userId;
                var channels = userIdNChannelsMap[userId];
                if (channels == null) {
                    channels = [];
                    userIdNChannelsMap[userId] = channels;
                }
                channels.push(channel);

                //check watch list
                var b1 = userIdNOuttimeMap[userId] == null;
                if (b1 && channels.length == 1) {
                    //user go online
                    this.start(userId);
                }
                //remove user from watch list
                if (!b1) {
                    delete userIdNOuttimeMap[userId];
                }
                //device
                if (deviceId != null) {
                    channelNDeviceIdMap[channel.getId()] = deviceId;
                }
                break;
            }
            case "expressjs":
            {
                var channels = userIdNChannelsMap[userId];
                if (channels == null) {
                    //session watch list
                    userIdNOuttimeMap[userId] = (new Date()).getTime();
                    //check and start new session if any
                    self.start(userId);
                }
                break;
            }
            default :
            {
                fireInvalidChannelType(channel.getType());
            }
        }
    };

    this.unmap = function (channel, userId) {

        $logger.debug("Unmap: userId: " + userId);

        delete channelNUserIdMap[channel.getId()];
        delete channelNDeviceIdMap[channel.getId()];
        var channels = userIdNChannelsMap[userId];

        if (channels == null) {
            throw new Error("Channels for user " + userId + " must be not NULL");
        }
        var channelIdx = channels.indexOf(channel);
        if (channelIdx > -1) {
            channels.splice(channelIdx, 1);
        }
        if (channels.length == 0) {
            userIdNOuttimeMap[userId] = (new Date()).getTime();
        }
    };

    this.start = function (userId) {
        if (userIdNSessionDataMap[userId] == null) {
            userIdNSessionDataMap[userId] = {};
            $event.fire("user.go.online", userId);
        }
    };

    this.destroy = function (userId) {
        $event.fire("user.going.offline", userId);
        delete userIdNSessionDataMap[userId];
        delete userIdNOuttimeMap[userId];
        var channels = userIdNChannelsMap[userId];
        if (channels != null) {
            channels.forEach(function (channel) {
                delete channelNUserIdMap[channel.getId()];
                delete channelNDeviceIdMap[channel.getId()];
            });
            delete userIdNChannelsMap[userId];
        }
        //fire event
        $event.fire("user.go.offline", userId);
    };

    this.get = function (userId) {
        return userIdNSessionDataMap[userId];
    };

    /**
     * Only return socket.io channels
     * @param {type} userId
     * @returns {nm$_session-service.SessionService.userIdNChannelsMap|userIdNChannelsMap}
     */
    this.getChannelsByUserId = function (userId) {
        return userIdNChannelsMap[userId];
    };

    this.getDeviceId = function (channel) {
        return channelNDeviceIdMap[channel.getId()];
    };

    this.has = function (userId) {
        return userIdNChannelsMap[userId] != null;
    };

    this.getUserIdByChannel = function (channel) {
        switch (channel.getType()) {
            case "socket.io":
            {
                return channelNUserIdMap[channel.getId()];
            }
            case "expressjs":
            {
                //extract userId from channel header
                return channel.getUserId();
            }
            default:
            {
                fireInvalidChannelType(channel.getType());
            }
        }
    };

    //validate sessions
    setInterval(checkUsersOnlineStatus, $config.session.checker.period);

    //--------------------------------------------------------------------------
    //  Utils
    function checkUsersOnlineStatus() {
        var offlineUserIds = [];
        var now = (new Date()).getTime();
        for (var userId in userIdNOuttimeMap) {
            var outtime = userIdNOuttimeMap[userId];
            if (now - outtime > $config.session.checker.timeout) {
                offlineUserIds.push(userId);
                //debug
                $logger.debug("User go offline, userId: " + userId);
            }
        }
        offlineUserIds.forEach(function (offlineUserId) {
            self.destroy(offlineUserId);
        });
    }

    function fireInvalidChannelType(channelType) {
        throw new Error("Invalid channel type: " + channelType + ". Only accepts: socket.io or expressjs");
    }
}
