/* 
 * For serving resource
 */

var express = require("express");

var Promise = require("bluebird");

module.exports = function ($config, http, $invoke) {

    var express = require("express");
    var expressApp = express();

    expressApp.set("view engine", "jade");
    expressApp.set("views", "./client/view");

    http.on("request", expressApp);

    var resolveParameterFx = buildResolveParameterFx(expressApp);

    return new Promise(function (resolve, reject) {
        Promise.resolve($invoke(require("./base-start/resources.js"), null, resolveParameterFx))
                .then(function () {
                    return Promise.resolve($invoke(require("../start/resources.js"), null, resolveParameterFx));
                })
                .then(function () {
                    expressApp.all("*", function (req, res) {
                        var message = $config.name + ": ";
                        var status = 200;
                        if (req.url == "/") {
                            message += "Hello world!";
                        } else {
                            status = 404;
                            message += "Page not found";
                        }
                        res.status(status)
                                .end(message);
                    });
                    resolve();
                })
                .catch(function (error) {
                    reject(error);
                });
    });
};

function buildResolveParameterFx(expressApp) {
    return function (parameter) {
        var retVal = null;

        switch (parameter) {
            case "$getResource":
            {
                retVal = buildGetResourceFx(expressApp);
                break;
            }
            case "$postResource":
            {
                retVal = buildPostResourceFx(expressApp);
                break;
            }
            case "$useStaticResource":
            {
                retVal = buildUseStaticResourceFx(expressApp);
                break;
            }
        }
        return retVal;
    };
}



function buildGetResourceFx(expressApp) {
    return function (name, callback) {
        expressApp.get(name, callback);
    };
}

function buildPostResourceFx(expressApp) {
    return function () {
          expressApp.post.apply(expressApp, arguments);
    };
}

function buildUseStaticResourceFx(expressApp) {
    return function (directory) {
        expressApp.use(express.static(directory));
    };
}