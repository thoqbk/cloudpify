/**
 * Dispatch a stanza to a controller action
 * @param {type} $event
 * @param {type} controllerLoader contains information about all controllers and actions
 * controllerLoader is not a service in IoC controller, it is created by start/servers.js
 */

var Input = require("../lib/Input.js");

var Response = require("../lib/Response.js");

var Q = require("q");

module.exports = function (userService, sessionService, $event, $logger, controllerLoader, $invokeFx) {

    var route = new (require("../lib/route.js"))();
    require("../start/routes.js")(route);

    $event.listen("dispatch.stanza", dispatchStanza);


    function dispatchStanza(stanza, channel) {
        var userId = sessionService.getUserIdByChannel(channel);
        var ns = stanza.ns;
        var actionPath = route.getActionPath(ns, stanza.stanza);
        var controller = controllerLoader.getController(actionPath);
        var actionFx = controllerLoader.getAction(actionPath);
        if (actionPath == null || controller == null || actionFx == null) {
            var message = "Action not found: " + ns + ", stanza: " + stanza.stanza;

            var responseStanza = {
                id: stanza.id,
                stanza: stanza.stanza,
                ns: ns,
                type: "error",
                body: message
            };

            channel.emit(responseStanza);

            $logger.debug(message);
            return;
        }
        //ELSE:
        var group = route.getGroup(ns, stanza.stanza);
        var beforeFx = group.getBeforeFx();
        var afterFx = group.getAfterFx();

        $input = new Input(userId, stanza, channel);
        $session = sessionService.get(userId);
        $response = new Response(userService, sessionService, channel, stanza);

        Q(beforeFx != null ? $invokeFx(beforeFx, null, buildActionArgumentsResolver($input, $session, $response)) : null)
                .then(function () {
                    if (!$response.isEnded()) {
                        return $invokeFx(actionFx, controller, buildActionArgumentsResolver($input, $session, $response));
                    }
                })
                .then(function () {
                    return afterFx != null ? $invokeFx(afterFx, null, buildActionArgumentsResolver($input, $session, $response)) : null;
                })
                .fail(function (error) {
                    $logger.debug("Error occurs on processing request: " + actionPath + ": " + error.stack);
                });
    }
};

function buildActionArgumentsResolver($input, $session, $response) {
    return function (parameter) {
        var retVal = null;
        switch (parameter) {
            case "$input":
            {
                retVal = $input;
                break;
            }
            case "$session":
            {
                retVal = $session;
                break;
            }
            case "$response":
            {
                retVal = $response;
                break;
            }
        }
        return retVal;
    };
}