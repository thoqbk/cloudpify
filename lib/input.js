/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Jul 27, 2015 11:17:31 PM
 * 
 */
module.exports = Input;

function Input(userId, stanza, channel) {

    this.getChannel = function () {
        return channel;
    };

    this.getUserId = function () {
        return userId;
    };

    this.getNs = function () {
        return stanza.ns;
    };

    this.getType = function () {
        return stanza.type;
    };

    this.getStanza = function () {
        return stanza.stanza;
    };

    this.getReceiverId = function () {
        return stanza.receiverId;
    };

    this.getId = function () {
        return stanza.id;
    };

    this.get = function (key, defaultValue) {
        if (key == null) {
            return stanza.body;
        }
        //ELSE:
        var keyParts = key.split(".");
        var retVal = stanza.body;
        keyParts.forEach(function (keyPart) {
            if (retVal != null) {
                retVal = retVal[keyPart];
            }
        });
        if (retVal == null) {
            retVal = defaultValue;
        }
        //return
        return retVal;
    };

    this.has = function (key) {
        var retVal = false;
        if (key == null) {
            return retVal;
        }
        var keyParts = key.split(".");
        retVal = true;
        var value = stanza.body;
        keyParts.forEach(function (keyPart) {
            if (value[keyPart] != null && retVal) {
                value = value[keyPart];
            } else {
                retVal = false;
            }
        });
        return retVal;
    };    
}