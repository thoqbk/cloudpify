/**
 * Dispatch a stanza to a controller action
 * @param {type} $event
 * @param {type} controllerLoader contains information about all controllers and actions
 * controllerLoader is not a service in IoC controller, it is created by start/servers.js
 */

var Input = require("../lib/input.js");

var Response = require("../lib/response.js");

var Q = require("q");

module.exports = function (userService, sessionService, $event, $logger, controllerLoader, $invokeFx) {

    var route = new (require("../lib/route.js"))();
    require("../start/routes.js")(route);

    //verify actionPath in routing rules
    var routingRules = route.getAllRules();
    routingRules.forEach(function (routingRule) {
        var actionFx = controllerLoader.getAction(routingRule.actionPath);
        if (actionFx == null) {
            throw new Error("Action path not found, re-check following routing rule: " + JSON.stringify({
                action: routingRule.action,
                actionPath: routingRule.actionPath
            }));
        }
    });


    $event.listen("dispatch.stanza", dispatchStanza);


    function dispatchStanza(stanza, channel) {
        var userId = sessionService.getUserIdByChannel(channel);
        var action = stanza.action;
        var actionPath = route.getActionPath(action);
        var controller = controllerLoader.getController(actionPath);
        var actionFx = controllerLoader.getAction(actionPath);
        var errorResponseStanza = {
            id: stanza.id,
            action: action,
            type: "error"
        };
        if (actionPath == null || controller == null || actionFx == null) {
            var message = "Action not found: " + action;
            errorResponseStanza.body = message;

            channel.emit(errorResponseStanza);

            $logger.debug(message);
            return;
        }
        //ELSE:
        var group = route.getGroup(action);
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
                    var message = "Error occurs on processing request: " + actionPath + ": " + error.stack;
                    $logger.debug(message);
                    errorResponseStanza.body = message;
                    channel.emit(errorResponseStanza);
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