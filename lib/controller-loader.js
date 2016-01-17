/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Jul 24, 2015 11:22:42 PM
 *
 */

var Fx = require("./fx");

module.exports = ControllerLoader;

function ControllerLoader($logger, $buildFx) {

    var actionPathNControllerMap = {};
    var actionPathNActionMap = {};
    var actionPathNParametersMap = {};

    this.load = function (filePath) {
        $logger.info("Begin loading controller file: " + filePath);
        var beginIdx = filePath.lastIndexOf("/") + 1;
        var fileName = filePath.substring(beginIdx);
        var controllerName = fileNameToControllerName(fileName);
        
        var controllerConstructor = require("../" + filePath);
        //debug
        $logger.info("Found constructor parameters: " + JSON.stringify(Fx.extractParameters(controllerConstructor)));
        
        //create controller instance
        var controller = $buildFx(controllerConstructor);
        var actions = Fx.getMethodNames(controller);
        
        actions.forEach(function (action) {
            var actionPath = controllerName + "@" + action;
            //parse action parameters
            var actionFx = controller[action];
            var actionParameters = Fx.extractParameters(actionFx);
            //save
            actionPathNControllerMap[actionPath] = controller;
            actionPathNActionMap[actionPath] = actionFx;
            actionPathNParametersMap[actionPath] = actionParameters;
            //debug
            $logger.info("Found action: " + actionPath + ", action parameters: " + JSON.stringify(actionParameters));
        });
    };

    this.getParameters = function (actionPath) {
        return actionPathNParametersMap[actionPath];
    };

    this.getAction = function (actionPath) {
        return actionPathNActionMap[actionPath];
    };

    this.getController = function (actionPath) {
        return actionPathNControllerMap[actionPath];
    };
}
//------------------------------------------------------------------------------
//  Utils
function fileNameToControllerName(fileName) {
    return fileName.replace(/(^(.)|\-(.))/gi, function (match) {
        if (match.length == 1) {
            return match.toUpperCase();
        } else {
            return match.replace("-", "").toUpperCase();
        }
    });
}

