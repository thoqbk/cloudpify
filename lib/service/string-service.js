/**
 * Copyright (C) 2015, Cloudchat
 * 
 * Tho Q Luong <thoqbk@gmail.com>
 * 
 * Sep 26, 2015 5:14:39 PM
 * 
 */

if (typeof module !== 'undefined' && module.exports != null) {
    module.exports = StringService;
}

function StringService() {
    var FRIENDLY_CHARACTER_MAP = {
        "à": "a", "ả": "a", "ã": "a", "á": "a", "ạ": "a", "ă": "a", "ằ": "a", "ẳ": "a", "ẵ": "a",
        "ắ": "a", "ặ": "a", "â": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ấ": "a", "ậ": "a", "đ": "d",
        "è": "e", "ẻ": "e", "ẽ": "e", "é": "e", "ẹ": "e", "ê": "e", "ề": "e", "ể": "e", "ễ": "e",
        "ế": "e", "ệ": "e", "ì": 'i', "ỉ": 'i', "ĩ": 'i', "í": 'i', "ị": 'i', "ò": 'o', "ỏ": 'o',
        "õ": "o", "ó": "o", "ọ": "o", "ô": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ố": "o", "ộ": "o",
        "ơ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ớ": "o", "ợ": "o", "ù": "u", "ủ": "u", "ũ": "u",
        "ú": "u", "ụ": "u", "ư": "u", "ừ": "u", "ử": "u", "ữ": "u", "ứ": "u", "ự": "u", "ỳ": "y",
        "ỷ": "y", "ỹ": "y", "ý": "y", "ỵ": "y", "À": "A", "Ả": "A", "Ã": "A", "Á": "A", "Ạ": "A",
        "Ă": "A", "Ằ": "A", "Ẳ": "A", "Ẵ": "A", "Ắ": "A", "Ặ": "A", "Â": "A", "Ầ": "A", "Ẩ": "A",
        "Ẫ": "A", "Ấ": "A", "Ậ": "A", "Đ": "D", "È": "E", "Ẻ": "E", "Ẽ": "E", "É": "E", "Ẹ": "E",
        "Ê": "E", "Ề": "E", "Ể": "E", "Ễ": "E", "Ế": "E", "Ệ": "E", "Ì": "I", "Ỉ": "I", "Ĩ": "I",
        "Í": "I", "Ị": "I", "Ò": "O", "Ỏ": "O", "Õ": "O", "Ó": "O", "Ọ": "O", "Ô": "O", "Ồ": "O",
        "Ổ": "O", "Ỗ": "O", "Ố": "O", "Ộ": "O", "Ơ": "O", "Ờ": "O", "Ở": "O", "Ỡ": "O", "Ớ": "O",
        "Ợ": "O", "Ù": "U", "Ủ": "U", "Ũ": "U", "Ú": "U", "Ụ": "U", "Ư": "U", "Ừ": "U", "Ử": "U",
        "Ữ": "U", "Ứ": "U", "Ự": "U", "Ỳ": "Y", "Ỷ": "Y", "Ỹ": "Y", "Ý": "Y", "Ỵ": "Y"
    };

    this.toFriendlyString = function (originalString) {
        if (originalString == null || originalString.length == 0) {
            return originalString;
        }
        //ELSE:
        var removedDuplicatedSpacesString = originalString.replace(/\s+/g, " ");
        var removedUnfriendlyCharsString = "";
        for (var idx = 0; idx < removedDuplicatedSpacesString.length; idx++) {
            var ch = removedDuplicatedSpacesString[idx];
            var alternativeChar = FRIENDLY_CHARACTER_MAP[ch];
            if (alternativeChar != null) {
                removedUnfriendlyCharsString += alternativeChar;
            } else {
                removedUnfriendlyCharsString += ch;
            }
        }
        return removedUnfriendlyCharsString.toLowerCase()
                .replace(/[^0-9a-zA-Z]/g, "-")
                .replace(/\-+/g, "-");
    };

    this.isEmptyString = function (string) {
        var regex = /^\s*$/;
        var retVal = string == null || (typeof string.match == "function" && string.match(regex) != null);
        return retVal;
    };

    this.calculateHash = function (mapOrArray, exceptKeys) {
        var retVal = null;
        if (mapOrArray == null) {
            return retVal;
        }
        retVal = "";
        var isArray = Object.prototype.toString.call(mapOrArray) === '[object Array]';
        var map = mapOrArray;
        if (isArray) {
            map = {};
            mapOrArray.forEach(function (value) {
                map[value] = value;
            });
        }
        var keys = Object.keys(map);
        var sortedKeys = keys.sort(function (a, b) {
            return map[b] - map[a];
        });

        sortedKeys.forEach(function (key) {
            var isExceptedKey = false;
            if (exceptKeys != null) {
                exceptKeys.forEach(function (exceptedKey) {
                    if (key == exceptedKey) {
                        isExceptedKey = true;
                    }
                });
            }
            if (!isExceptedKey) {
                var value = map[key];
                if (value != null) {
                    value = ("" + value).toLowerCase();
                }
                if (retVal.length > 0) {
                    retVal += ";";
                }
                retVal += key + ":" + value;
            }
        });
        //return
        return retVal;
    };
}