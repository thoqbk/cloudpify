/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 22:48 August 21, 2015
 */

module.exports = Response;

function Response(userService, sessionService, channel, stanzaRequest) {

    var ended = false;

    var self = this;
    
    this.toOnlineFriends = function (userId, stanza) {
        userService.find({onlineStatus: "online"})
                .then(function (users) {
                    users.forEach(function (user) {
                        if (user.id != userId) {
                            self.to(user.id, stanza);
                        }
                    });
                });
    };

    this.to = function (userId, stanza) {
        var channels = sessionService.getChannelsByUserId(userId);
        if (channels != null) {
            channels.forEach(function (channel) {
                channel.emit(stanza);
            });
        }
    };

    this.end = function (body) {
        if (!ended && (body != null || stanzaRequest.stanza == "iq")) {
            var response = {
                id: stanzaRequest.id,
                stanza: stanzaRequest.stanza,
                ns: stanzaRequest.ns,
                body: body
            };
            if (stanzaRequest.stanza == "iq") {
                response.type = "result";
            }
            this.echo(response);
        }
        ended = true;
    };

    this.error = function (message) {
        if (stanzaRequest.stanza != "iq") {
            throw new Error("Can't reply error for a non-iq stanza");
        }
        var response = {
            id: stanzaRequest.id,
            stanza: stanzaRequest.stanza,
            ns: stanzaRequest.ns,
            type: "error",
            body: message
        };
        this.echo(response);
    };

    this.echo = function (stanzaResponse) {
        if (ended) {
            throw new Error("The iq request has already replied");
        }
        channel.emit(stanzaResponse);
        if (stanzaRequest.stanza == "iq" && (stanzaResponse.type == "result" || stanzaResponse.type == "error")) {
            ended = true;
        }
    };
    
    this.isEnded = function(){
        return ended;
    };
}
