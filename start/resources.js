/**
 * Register public resources
 */

var path = require('path');

module.exports = function ($getResourceFx, $useStaticResourceFx) {
    
    $useStaticResourceFx(path.resolve(__dirname + "/../client/public"));

    //common js libraries
    $getResourceFx("/service/string-service.js", function (req, res) {
        res.sendFile(path.resolve(__dirname + "/../lib/service/string-service.js"));
    });

    $getResourceFx("/script/q.js", function (req, res) {
        res.sendFile(path.resolve(__dirname + "/../node_modules/q/q.js"));
    });
};

