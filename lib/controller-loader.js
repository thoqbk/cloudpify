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

    var self = this;

    var actionPathNControllerMap = {};
    var actionPathNActionMap = {};
    var actionPathNParametersMap = {};

    var controllerNameNActionPathsMap = {};
    var filePathNControllerNameMap = {};

    var nameNControllerMap = {};

    this.loadAllControllers = function () {
        var scanner = new AnnotationScanner();
        return new Promise(function (resolve, reject) {
            scanner.scan($config.scanDirectories)
                    .then(function () {
                        //all controllers
                        var filePaths = scanner.getFilesByAnnotation("Controller");
                        filePaths.forEach(function (filePath) {
                            var controllerAnnotation = scanner.getAnnotation(filePath, "Controller");
                            loadByFilePath(controllerAnnotation, filePath);
                        });
                        resolve();
                    })
                    .catch(reject);
        });
    };

    this.reloadController = function (filePath) {
        return new Promise(function (resolve, reject) {
            self.unloadController(filePath)
                    .then(function (isController) {
                        if (isController) {
                            return self.loadController(filePath);
                        }
                    })
                    .then(resolve)
                    .catch(reject);
        });
    };

    this.unloadController = function (filePath) {
        return new Promise(function (resolve, reject) {
            var controllerName = filePathNControllerNameMap[filePath];
            if (controllerName == null) {
                $logger.debug("Unload has been cancelled, file: " + filePath + " doesn't contain a controller");
                resolve(false);
                return;
            }
            //ELSE:
            var actionPaths = controllerNameNActionPathsMap[controllerName];
            actionPaths.forEach(function (actionPath) {
                delete actionPathNActionMap[actionPath];
                delete actionPathNControllerMap[actionPath];
                delete actionPathNParametersMap[actionPath];
            });
            delete controllerNameNActionPathsMap[controllerName];
            delete nameNControllerMap[controllerName];
            //uncache require
            var rootPath = "../";
            delete require.cache[require.resolve(rootPath + filePath)];
            $logger.debug("Unload controller " + controllerName + " successfully. File: " + filePath);
            resolve(true);
        });
    };

    this.loadController = function (filePath) {
        return new Promise(function (resolve, reject) {
            var scanner = new AnnotationScanner();
            scanner.scan([filePath])
                    .then(function () {
                        var rootPath = "../";
                        var controllerFilePaths = scanner.getFilesByAnnotation("Controller");
                        if (controllerFilePaths.length == 0) {
                            $logger.debug("Load controller has been cancelled. File " + filePath + " doesn't contain a controller");
                            resolve(false);
                            return;
                        }
                        //ELSE:
                        //var controllerFilePath = rootPath + filePath;
                        var controllerAnnotation = scanner.getAnnotation(filePath, "Controller");
                        loadByFilePath(controllerAnnotation, filePath);
                        $logger.debug("Load controller successfully. File: " + filePath);
                        resolve(true);
                    })
                    .catch(reject);
        });
    };

    function loadByFilePath(controllerAnnotation, filePath) {
        $logger.info("Begin loading controller file: " + filePath);
        var controllerClass = require("../" + filePath);
        var controllerName = controllerAnnotation.parameters["name"];
        load(controllerName, controllerClass);
        //map
        filePathNControllerNameMap[filePath] = controllerName;
    }

    function load(controllerName, controllerConstructor) {
        //debug
        $logger.info("Found constructor parameters: " + JSON.stringify(Fx.extractParameters(controllerConstructor)));

        //create controller instance
        var controller = $build(controllerConstructor);
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

