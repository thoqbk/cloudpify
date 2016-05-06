/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Jul 24, 2015 11:22:42 PM
 *
 */

var Fx = require("./fx");

var AnnotationScanner = require("./annotation-scanner.js");

module.exports = ControllerLoader;

function ControllerLoader($logger, $build, $resolve, $config) {

    var actionPathNControllerMap = {};
    var actionPathNActionMap = {};
    var actionPathNParametersMap = {};

    this.loadAllControllers = function () {
        var scanner = new AnnotationScanner();
        return new Promise(function (resolve, reject) {
            scanner.scan($config.scanDirectories)
                    .then(function () {
                        var rootPath = "../";
                        //all controllers
                        var controllerFilePaths = scanner.getFilesByAnnotation("Controller");
                        controllerFilePaths.forEach(function (controllerFilePath) {
                            $logger.info("Begin loading controller file: " + controllerFilePath);
                            var controllerAnnotation = scanner.getAnnotation(controllerFilePath, "Controller");
                            var controllerClass = require(rootPath + controllerFilePath);
                            load(controllerAnnotation.parameters["name"], controllerClass);
                        });
                        resolve();
                    })
                    .catch(reject);
        });

    };


    function load(controllerName, controllerConstructor) {
        //debug
        $logger.info("Found constructor parameters: " + JSON.stringify(Fx.extractParameters(controllerConstructor)));

        //create controller instance
        var controller = $build(controllerConstructor);
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
    }
    ;

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

    function cacheControllerByActionPath(actionPath) {
        if (actionPathNControllerMap[actionPath] != null) {
            return;
        }
        //ELSE:
        var actionPathItems = actionPath.split('@');
        if (actionPathItems.length != 2) {
            throw new Error("Invalid action path: " + actionPath);
        }
        var controllerName = actionPathItems[0];
        var actionName = actionPathItems[1];

        var controller = $resolve(controllerName);
        if (controller == null) {
            throw new Error("Controller not found: " + controllerName + ", actionPath: " + actionPath);
        }
        if (controller[actionName] == null) {
            throw new Error("Action not found: " + controllerName + ", actionPath: " + actionPath);
        }

    }
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

