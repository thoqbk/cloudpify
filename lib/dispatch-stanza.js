/**
 * Dispatch a stanza to a controller action
 * @param {type} $event
 * @param {type} controllerLoader contains information about all controllers and actions
 * controllerLoader is not a service in IoC controller, it is created by start/servers.js
 */

var Input = require("../lib/Input");

module.exports = function (sessionService, $event, $logger, controllerLoader, $invokeFx) {

    var route = new (require("../lib/route.js"))();
    require("../start/routes.js")(route);

    $event.listen("dispatch.stanza", dispatchStanza);


    function dispatchStanza(stanza, channel) {
        var userId = sessionService.getUserIdByChannel(channel);
        var ns = stanza.ns;
        var actionPath = route.getActionPath(ns, stanza.stanza);
        var notFound = true;
        if (actionPath != null) {
            var controller = controllerLoader.getController(actionPath);
            var actionFx = controllerLoader.getAction(actionPath);

            if (controller != null && actionFx != null) {
                $invokeFx(actionFx, controller, function (parameter) {
                    var retVal = null;
                    switch (parameter) {
                        case "$input":
                        {
                            retVal = new Input(userId, stanza, channel);
                            break;
                        }
                        case "$session":
                        {
                            retVal = sessionService.get(userId);
                            break;
                        }
                        default:
                        {

                        }
                    }
                    return retVal;
                });
                notFound = false;
            }
        }
        if (notFound) {
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
        }
    }
};
