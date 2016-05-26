/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Jul 24, 2015 11:22:42 PM
 *
 */

var Fx = require("buncha").Fx;

module.exports = ControllerLoader;

function ControllerLoader($logger, $resolveByAnnotation) {

    var actionPathNControllerMap = {};
    var actionPathNActionMap = {};
    var actionPathNParametersMap = {};

    var controllerNameNActionPathsMap = {};

    var nameNControllerMap = {};

    this.loadAllControllers = function () {
        var nameNControllers = $resolveByAnnotation("Controller");
        for (var controllerName in nameNControllers) {            
            var controller = nameNControllers[controllerName];
            load(controllerName, controller);
        }
    };

    function load(controllerName, controller) {

        var actions = Fx.getMethodNames(controller);

        var actionPaths = [];
        actions.forEach(function (action) {
            var actionPath = controllerName + "@" + action;
            //parse action parameters
            var actionFx = controller[action];
            var actionParameters = Fx.extractParameters(actionFx);
            //save
            actionPathNControllerMap[actionPath] = controller;
            actionPathNActionMap[actionPath] = actionFx;
            actionPathNParametersMap[actionPath] = actionParameters;

            actionPaths.push(actionPath);
            //debug
            $logger.info("Found action: " + actionPath + ", action parameters: " + JSON.stringify(actionParameters));
        });
        controllerNameNActionPathsMap[controllerName] = actionPaths;
        nameNControllerMap[controllerName] = controller;
    }

    this.getParameters = function (actionPath) {
        return actionPathNParametersMap[actionPath];
    };

    this.getAction = function (actionPath) {
        return actionPathNActionMap[actionPath];
    };

    this.getController = function (actionPath) {
        var retVal = actionPathNControllerMap[actionPath];
        if (retVal == null) {

        }
        return retVal;
    };
}
//------------------------------------------------------------------------------
//  Utils

