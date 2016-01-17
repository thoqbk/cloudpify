/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Aug 9, 2015 12:38:41 AM
 * 
 */

var Fx = {};

module.exports = Fx;
//------------------------------------------------------------------------------
//  Members
var fxNParametersMap = {}; //for caching
var objectNMethodNamesMap = {}; //for caching

Fx.extractParameters = extractParameters;

Fx.getMethodNames = function (object) {
    var retVal = objectNMethodNamesMap[object];
    if (retVal == null) {
        retVal = [];
        for (var propertyName in object) {
            if (typeof object[propertyName] === 'function') {
                retVal.push(propertyName);
            }
        }
    }
    //return
    return retVal;
};

//------------------------------------------------------------------------------
//  Utils
function removeSingeLineComments(fxString) {
    return fxString.replace(/\/\/.*/g, "");
}

function removeMultiLineComments(fxString) {
    return fxString.replace(/\/\*[\s\S]*?\*\//g, "");
}

function extractParameterPart(fxString) {
    var matches = fxString.match(/\(([\s\S]*?)\)/);
    return matches[1];
}

function extractParameters(fx) {
    var retVal = fxNParametersMap[fx];
    if (retVal == null) {
        var retVal = [];
        var fxString = fx.toString();
        //remove all comments
        var woSingleLineComments = removeSingeLineComments(fxString);
        var woMultiLineComments = removeMultiLineComments(woSingleLineComments);
        var parameterPart = extractParameterPart(woMultiLineComments);
        var parameters = parameterPart.split(",");
        parameters.forEach(function (parameter) {
            var stdParameter = parameter.replace(/\s+/g, "");
            if (stdParameter.length > 0) {
                retVal.push(stdParameter);
            }
        });
    }
    //return
    return retVal;
}