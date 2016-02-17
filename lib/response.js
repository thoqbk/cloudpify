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

    this.to = function (userId, stanza) {
        var channels = sessionService.getChannelsByUserId(userId);
        if (channels != null) {
            channels.forEach(function (channel) {
                channel.emit(stanza);
            });
        }
    };

    this.end = function (body) {
        if (!ended && body != null) {
            var response = {
                id: stanzaRequest.id,
                action: stanzaRequest.action,
                body: body
            };
            if (stanzaRequest.type == "iq") {
                response.type = "result";
            }
            this.echo(response);
            ended = true;
        } else if (ended) {
            throw new Error("The response has been ended. "
                    + "Re-check your code to ensure that it doesn't call end more than ONE times per an iq-request");
        } else if (body == null) {
            throw new Error("End with empty body content");
        }
    };

    this.error = function (message) {
        var response = {
            id: stanzaRequest.id,
            action: stanzaRequest.action,
            type: "error",
            body: message
        };
        this.echo(response);
    };

    this.echo = function (stanzaResponse) {
        if (ended) {
            throw new Error("The stanza request has already been replied");
        }
        if (stanzaRequest.type != "iq") {
            throw new Error("Can't reply for a non-iq stanza");
        }
        channel.emit(stanzaResponse);
        if (stanzaRequest.type == "iq" && (stanzaResponse.type == "result" || stanzaResponse.type == "error")) {
            ended = true;
        }
    };

    this.isEnded = function () {
        return ended;
    };
}
