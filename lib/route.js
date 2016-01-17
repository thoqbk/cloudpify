/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 00:04 June 22, 2015
 */

module.exports = Route;

function Route() {
    var allRules = [];

    this.iq = function (ns, actionPath) {
        createRoutingRule("iq", ns, actionPath);
    };

    this.m = function (ns, actionPath) {
        createRoutingRule("m", ns, actionPath);
    };

    this.any = function (ns, actionPath) {
        this.iq(ns, actionPath);
        this.m(ns, actionPath);
    };

    this.getAllRules = function () {
        return allRules;
    };

    this.getActionPath = function (ns, stanza) {
        var retVal = null;
        allRules.forEach(function (rule) {
            if (rule.ns == ns && rule.stanza == stanza) {
                retVal = rule.actionPath;
            }
        });
        //return
        return retVal;
    };

    function createRoutingRule(stanza, ns, actionPath) {
        allRules.push({
            stanza: stanza,
            ns: ns,
            actionPath: actionPath
        });
    }
}
