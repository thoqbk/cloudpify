/* global __dirname */

/**
 * Copyright (C) 2015, Cloudchat
 *
 * Tho Q Luong <thoqbk@gmail.com>
 *
 * Jul 22, 2015 11:27:37 PM
 *
 */

var handler = new (require("./lib/handler.js"))();

var applicationMode = "full";//app+service
process.argv.forEach(function (val) {
    if (val == "mode=service") {
        applicationMode = "service";
    }
    if (val == "mode=app") {
        applicationMode = "app";
    }
});

handler.start(applicationMode)
        .catch(function () {
            process.exit(1);
        });
