/* 
 * For serving resource
 */

var express = require("express");

var Q = require("q");

module.exports = function ($config, http, $invokeFx) {

    var retVal = Q.defer();

    var express = require("express");
    var expressApp = express();

    expressApp.set("view engine", "jade");
    expressApp.set("views", "./client/view");

    http.on("request", expressApp);

    var resolveParameterFx = buildResolveParameterFx(expressApp);

    Q($invokeFx(require("./base-start/resources.js"), null, resolveParameterFx))
            .then(function () {
                return Q($invokeFx(require("../start/resources.js"), null, resolveParameterFx));
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
                retVal.resolve();
            })
            .fail(function (error) {
                retVal.reject(error);
            });

    return retVal.promise;
};

function buildResolveParameterFx(expressApp) {
    return function (parameter) {
        var retVal = null;

        switch (parameter) {
            case "$getResourceFx":
            {
                retVal = buildGetResourceFx(expressApp);
                break;
            }
            case "$postResourceFx":
            {
                retVal = buildPostResourceFx(expressApp);
                break;
            }
            case "$useStaticResourceFx":
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
    return function (name, callback) {
        expressApp.post(name, callback);
    };
}

function buildUseStaticResourceFx(expressApp) {
    return function (directory) {
        expressApp.use(express.static(directory));
    };
}