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

  validateStanza(stanza);

  this.getChannel = function () {
    return channel;
  };

  this.getUserId = function () {
    return userId;
  };

  this.getAction = function () {
    return stanza.action;
  };

  this.getType = function () {
    return stanza.type;
  };

  this.isIq = function () {
    return stanza.type == "iq";
  };

  this.isM = function () {
    return stanza.type == "m";
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
      if (value != null && value[keyPart] != null && retVal) {
        value = value[keyPart];
      } else {
        retVal = false;
      }
    });
    return retVal;
  };

  function validateStanza(stanza) {
    //type
    var validStanzaTypes = ["iq", "m", "result", "error"];
    if (validStanzaTypes.indexOf(stanza.type)) {
      throw new Error("Invalid stanza.type: " + JSON.stringify(stanza));
    }
    //action
    var actionPattern = /^([^\-][a-z0-9\_\-]*[^\-]\:)*[^\-][a-z0-9\_\-]*[^\-]$/i;
    if (stanza.action == null || !stanza.action.match(actionPattern)) {
      throw new Error("Invalid action value: " + JSON.stringify(stanza));
    }

  }
}
