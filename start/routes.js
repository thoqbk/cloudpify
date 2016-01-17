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
    
    route.iq("cloudchat:sample-controller:hello", "SampleController@hello");
    
};