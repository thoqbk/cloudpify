/* 
 * For registering base resources
 */

var Channel = require("../channel.js");

var bson = require("bson");

var BSON = new bson.BSONPure.BSON();

module.exports = function ($postResource, $getResource,$config,
        $resolve, $logger, $event) {

    if ($config.applicationMode == "service") {
        $postResource("/cloud-service", function (request, response) {
            $event.fire("invoke.cloud-service", request, response);
        });
    }

    if ($config.applicationMode == "app" || $config.applicationMode == "full") {
        var sessionService = $resolve("sessionService");
        //post
        $postResource("/post-stanza", function (request, response) {
            $logger.debug("Content-Type: " + request.get("Content-Type"));
            processPostStanzaRequest(request, response, request.get("Content-Type") == "stanza/binary");
        });
    }

    $getResource("/version", (request, response) => {
      response.end($config.version);
    })

    function processStanzaRequest(response, channel, body, error) {
        var errorStanza = {
            type: "error"
        };

        if (error != null) {
            errorStanza.body = "" + error;
            response.end(JSON.stringify(errorStanza));
            return;
        }
        //ELSE:
        try {
            sessionService.map(channel, channel.getUserId());
            var stanza = null;
            if (Buffer.isBuffer(body)) {
                stanza = BSON.deserialize(body, {
                    promoteBuffers: true
                });
            } else {
                stanza = JSON.parse(body);
            }
            //fire event:
            $event.fire("dispatch.stanza", stanza, channel);
        } catch (error) {

            var bodyDescription = body;
            if (Buffer.isBuffer(body)) {
                bodyDescription = "(buffer-data)";
            } else if (body.length > 1024) {
                bodyDescription = "(> 1KB data, are you missing to add Content-Type: 'stanza/binary')";
            }

            var errorMessage = "Receive invalid data request: " + bodyDescription + ". Reason: " + error.stack;
            errorStanza.body = errorMessage;
            response.end(JSON.stringify(errorStanza));
            $logger.debug(errorMessage);
        }
    }

    function processPostStanzaRequest(request, response, isBinaryStanza) {
        var body = "";
        var chunks = [];
        request.on("data", function (data) {
            if (isBinaryStanza) {
                chunks.push(data);
            } else {
                body += data;
            }
        });
        request.on("end", function () {
            var userId = request.get("userId");
            if (userId == null) {
                userId = request.query.userId;
            }
            var token = request.get("token");
            if (token == null) {
                token = request.query.token;
            }

            var channel = new Channel(userId, request, response, $logger);

            if (isBinaryStanza) {
                body = Buffer.concat(chunks);
            }

            if ($event.has("channel.auth")) {
                $event.fire("channel.auth", userId, token, channel, function (error) {
                    processStanzaRequest(response, channel, body, error);
                });
            } else {
                processStanzaRequest(response, channel, body, null);
            }
        });
    }

};


