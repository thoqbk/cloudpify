/**
 * Channel is a abstract class of socket.io connection or a http connection
 * Depend on arguments passing in constructor, logic in Channel will decide what kind of channel is
 * Channel constructor samples:
 * 1. new Channel(socket);
 * 2. new Channel(request, response);
 */

module.exports = Channel;

var _ = require("underscore");


function Channel() {
    var type = null;
    var socketIOConnection = null;
    var expressjsRequest = null;
    var expressJsResponse = null;
    
    var userId = null;
    
    var id = null;

    var numberOfArgs = arguments.length;
    if (numberOfArgs == 2 && arguments[1].emit != null) {//could be socket.io
        userId = arguments[0];
        socketIOConnection = arguments[1];
        type = "socket.io";
        id = socketIOConnection.id;
    } else if (numberOfArgs == 3) {//could be expressjs
        userId = arguments[0];
        expressjsRequest = arguments[1];
        expressJsResponse = arguments[2];
        type = "expressjs";        
    } else {
        throw new Error("Pass invalid parameter(s) for constructor");
    }

    this.emit = function (stanza) {
        switch (type) {
            case "socket.io":
            {
                socketIOConnection.emit("cloudchat", stanza);
                break;
            }
            case "expressjs":
            {
                expressJsResponse.end(JSON.stringify(stanza));
                break;
            }
        }
    };

    this.getType = function () {
        return type;
    };
    
    this.getUserId = function(){
        return userId;
    };
    
    this.getId = function(){
        if(id == null){
            id = _.uniqueId("chnlid");
        }
        return id;
    };
}
