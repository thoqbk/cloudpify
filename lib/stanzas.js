/**
 * Stanzas util
 */

var Stanzas = {};

module.exports = Stanzas;

Stanzas.wrapAsBinaryStanza = function (stanza) {
    if (stanza.body != null && !Buffer.isBuffer(stanza.body)) {
        throw new Error("Invalid body type, require type of null or buffer");
    }
    //ELSE:
    var length = binaryStanzaLength(stanza);

    var retVal = new Buffer(length);
    var nextPosition = 0;
    //id
    nextPosition = writeString(retVal, nextPosition, "" + stanza.id);
    //type
    nextPosition = writeString(retVal, nextPosition, stanza.type);
    //action
    nextPosition = writeString(retVal, nextPosition, stanza.action);
    //body: buffer
    if (stanza.body != null) {
        stanza.body.copy(retVal, nextPosition);
    }
    //return
    return retVal;
};

Stanzas.unwrapBinaryStanza = function (binaryStanza) {
    if (!Buffer.isBuffer(binaryStanza)) {
        throw new Error("Invalid binary Stanza data type, require buffer type");
    }
    var retVal = {};
    var position = 0;
    //id
    retVal.id = readString(binaryStanza, position);
    //type
    position += 4 + (retVal.id != null && retVal.id.length > 0 ? Buffer.byteLength(retVal.id, "utf8") : 0);

    retVal.type = readString(binaryStanza, position);
    //action
    position += 4 + (retVal.type != null && retVal.type.length > 0 ? Buffer.byteLength(retVal.type, "utf8") : 0);
    retVal.action = readString(binaryStanza, position);
    //body
    position += 4 + (retVal.action != null && retVal.action.length > 0 ? Buffer.byteLength(retVal.action, "utf8") : 0);
    if (position == binaryStanza.length) {
        retVal.body = null;
    } else {
        retVal.body = binaryStanza.slice(position);
    }
    //return
    return retVal;
};


function binaryStanzaLength(stanza) {
    //id, type, action, body
    var retVal = 4;
    if (stanza.id != null && ("" + stanza.id).length > 0) {
        retVal += Buffer.byteLength("" + stanza.id, "utf8");
    }
    //type
    retVal += 4 + Buffer.byteLength(stanza.type, "utf8");
    //action
    retVal += 4 + Buffer.byteLength(stanza.action);
    //body
    if (stanza.body != null) {
        retVal += stanza.body.length;
    }
    //return
    return retVal;
}

/**
 * Return next writing position
 * @param {type} buffer
 * @param {type} position
 * @param {type} str
 * @returns {undefined}
 */
function writeString(buffer, position, str) {
    var retVal = position;
    var length = 0;
    if (str != null && str.length > 0) {
        length = Buffer.byteLength(str, "utf8");
    }
    //length:    
    buffer.writeInt32BE(length, retVal);

    retVal += 4;
    //string
    if (length > 0) {
        buffer.write(str, retVal, length, "utf8");
    }
    retVal += length;
    //return
    return retVal;
}

function readString(buffer, position) {
    var retVal = null;
    var stringLength = buffer.readInt32BE(position);
    if (stringLength > 0) {
        retVal = buffer.toString("utf8", position + 4, position + 4 + stringLength);
    }
    //return
    return retVal;
}

