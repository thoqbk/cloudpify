/**
 * Register public resources
 */

var path = require('path');

module.exports = function ($getResource, $useStaticResource) {
    
    $useStaticResource(path.resolve(__dirname + "/../client/public"));

    //common js libraries
    $getResource("/service/string-service.js", function (req, res) {
        res.sendFile(path.resolve(__dirname + "/../lib/service/string-service.js"));
    });

    $getResource("/script/q.js", function (req, res) {
        res.sendFile(path.resolve(__dirname + "/../node_modules/q/q.js"));
    });
};

