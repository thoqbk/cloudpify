/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 9, 2015 12:10:55 AM
 * 
 */

var UserService = require("../service/user-service.js");

module.exports = function ($registerByClassFx) {
    
    $registerByClassFx("userService", UserService);

};