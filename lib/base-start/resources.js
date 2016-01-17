/* 
 * For registering base resources
 */

var Channel = require("../channel.js");

module.exports = function ($postResourceFx, $config,
        $resolveFx, $logger, $event) {

    if ($config.applicationMode == "service") {
        $postResourceFx("/cloud-service", function (request, response) {
            $event.fire("invoke.cloud-service", request, response);
        });
    }

    if ($config.applicationMode == "app" || $config.applicationMode == "full") {
        var sessionService = $resolveFx("sessionService");
        //post
        $postResourceFx("/post-stanza", function (request, response) {
            var body = "";
            request.on("data", function (data) {
                body += data;
            });
            request.on("end", function () {
                var userId = request.get("userId");
                var token = request.get("token");
                var channel = new Channel(userId, request, response);
                if ($event.has("auth")) {
                    $event.fire("auth", userId, token, channel, function (error) {
                        processStanzaRequest(response, channel, body, error);
                    });
                } else {
                    processRequest(response, channel, body, null);
                }
            });
        });
    }

    function processStanzaRequest(response, channel, body, error) {
        var errorStanza = {
            stanza: "iq",
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
            var stanza = JSON.parse(body);
            //fire event:
            $event.fire("dispatch.stanza", stanza, channel);
        } catch (error) {
            var errorMessage = "Receive invalid data request: " + body + ". Reason: " + error;
            errorStanza.body = errorMessage;
            response.end(JSON.stringify(errorMessage));
            $logger.debug(errorMessage);
        }
    }

};


