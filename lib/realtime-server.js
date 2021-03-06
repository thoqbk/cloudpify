/**
 * Initialize socket io and http server
 */

var Channel = require("./channel.js");

var bson = require("bson");

var BSON = new bson.BSONPure.BSON();

module.exports = function (sessionService, $logger, $event, http) {

    //socket IO
    var socketIO = require("socket.io")(http);

    socketIO.use(function (socket, next) {

        var userId = socket.handshake.query.userId;
        var token = socket.handshake.query.token;

        if ($event.has("channel.auth")) {
            $event.fire("channel.auth", userId, token, socket, next);
        } else {
            next();
        }
    });

    socketIO.on("connection", function (socket) {
        var userId = socket.handshake.query.userId;
        var deviceId = socket.handshake.query.deviceId;
        var channel = new Channel(userId, socket, $logger);
        sessionService.map(channel, userId, deviceId);

        $event.fire("channel.connection", channel);

        socket.on("cloudpify", function (stanzaData) {
            var stanza = stanzaData;
            if (Buffer.isBuffer(stanzaData)) {
                stanza = BSON.deserialize(stanzaData, {promoteBuffers: true});
            }
            //debug
            var debugStanza = {
                id: stanza.id,
                type: stanza.type,
                action: stanza.action,
                body: Buffer.isBuffer(stanzaData) ? "(buffer-data)" : stanzaData.body
            };
            $logger.debug("Received message: " + JSON.stringify(debugStanza) + " from: " + userId + "; socketId: " + socket.id);
            //fire event
            $event.fire("dispatch.stanza", stanza, channel);
        });
        socket.on("disconnect", function () {
            sessionService.unmap(channel, userId);
        });
    });
    
};