/**
 * Initialize socket io and http server
 */

var Q = require("q");

var Channel = require("./channel.js");

module.exports = function (sessionService, $logger, $event, http, Stanzas) {

    var retVal = Q.defer();

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
        var channel = new Channel(userId, socket);
        sessionService.map(channel, userId, deviceId);

        $event.fire("channel.connection", channel);

        socket.on("cloudpify", function (stanzaData) {
            var stanza = stanzaData;
            if (Buffer.isBuffer(stanzaData)) {
                stanza = Stanzas.unwrapBinaryStanza(stanzaData);
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

    retVal.resolve();

    return retVal.promise;
};