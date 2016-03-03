/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * June 15, 2015
 * 
 */


/**
 * 
 * @param {type} route
 * @returns {undefined}
 */
module.exports = function (route) {
    route.action("cloudchat:sample-controller:hello2", "SampleController@hello");
    route.group()
            .before(function ($input, $response, $logger) {
                var message = "Hello " + $input.get("username") + ", this is before";
                if ($input.get("deviceId") == "iphone") {
                    message += " .I like iphone!";
                } else {
                    message += " .I hate " + $input.get("deviceId");
                    $response.end(message);
                }
                $logger.debug(message);
            })
            .after(function ($input, $logger) {
                $logger.debug("Hello " + $input.get("username") + ", this is after");
            })
            .action("cloudchat:sample-controller:hello", "SampleController@hello");

};