/**
 * Watch for changes in controller and service files to reload them
 * 
 * Tho Q Luong
 * 
 * May 7, 2016
 * @param {type} $logger
 * @param {type} $config
 * @returns {undefined} 
 */

var chokidar = require('chokidar');

module.exports = function ($logger, $config, $resolve) {

    var directories = [].concat($config.scanDirectories);

    var controllerLoader = $resolve("__controllerLoader");

    var watcher = chokidar.watch(directories, {
        persistent: true,
        ignoreInitial: true
    });
    watcher
            .on("add", function (path) {
            })
            .on("change", function (path) {
                controllerLoader.reloadController(path)
                        .catch(function (err) {
                            $logger.error("Reload controller " + path + " fail. Reason: " + err.stack);
                        });
            })
            .on("unlink", function (path) {
            });
};

