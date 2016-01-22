/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 00:04 June 22, 2015
 */

module.exports = Route;

var allRules = [];
var nameNFilterMap = {};
var groups = [];

var _ = require("underscore");

/**
 * 
 * @param {type} b isRootGroup
 * @returns {nm$_route.Route}
 */
function Route(b) {

    var isRootGroup = (b !== false);

    var beforeFx = null;
    var afterFx = null;

    var self = this;

    this.group = function () {
        if (!isRootGroup) {
            throw new Error("Can't create child group from other child group");
        }
        var retVal = new Route(false);
        delete retVal["getActionPath"];
        delete retVal["filter"];
        delete retVal["getGroup"];
        groups.push(retVal);
        return retVal;
    };

    this.before = function (filterNameOrFx) {
        setFilter(filterNameOrFx, true);
        return self;
    };

    this.after = function (filterNameOrFx) {
        setFilter(filterNameOrFx, false);
        return self;
    };

    this.iq = function (ns, actionPath) {
        createRoutingRule("iq", ns, actionPath, self);
        return self;
    };

    this.m = function (ns, actionPath) {
        createRoutingRule("m", ns, actionPath, self);
        return self;
    };

    this.any = function (ns, actionPath) {
        this.iq(ns, actionPath);
        this.m(ns, actionPath);
        return self;
    };

    this.filter = function (name, fx) {
        nameNFilterMap[name] = fx;
    };

    this.getAllRules = function () {
        return allRules;
    };

    this.getActionPath = function (ns, stanza) {
        var rule = _.findWhere(allRules, {ns: ns, stanza: stanza});
        return rule == null ? null : rule.actionPath;
    };

    this.getGroup = function (ns, stanza) {
        var rule = _.findWhere(allRules, {ns: ns, stanza: stanza});
        return rule == null ? null : rule.group;
    };

    this.getBeforeFx = function () {
        return beforeFx;
    };

    this.getAfterFx = function () {
        return afterFx;
    };
    
    function setFilter(filterNameOrFx, isBeforeFilter) {
        var filterFx;
        if (typeof filterNameOrFx == "string") {
            if (nameNFilterMap[filterNameOrFx] == null) {
                throw new Error("Filter name not found: " + filterNameOrFx);
            }
            //ELSE:       
            filterFx = nameNFilterMap[filterNameOrFx];

        } else if (typeof filterNameOrFx == 'function') {
            filterFx = filterNameOrFx;
        } else {
            throw new Error("Invalid before filter type: " + (typeof filterNameOrFx));
        }
        if (isBeforeFilter) {
            beforeFx = filterFx;
        } else {
            afterFx = filterFx;
        }
    }
}

function createRoutingRule(stanza, ns, actionPath, group) {
    var existedActionPath = _.findWhere(allRules, {actionPath: actionPath, ns: ns}) != null;
    if (existedActionPath) {
        throw new Error("Routing rule has already existed, stanza: " + stanza + ", ns: " + ns);
    }
    validateNs(ns);
    allRules.push({
        stanza: stanza,
        ns: ns,
        actionPath: actionPath,
        group: group
    });
}

function validateNs(ns) {
    var nsPattern = /^([^\-][a-z0-9\_\-]*[^\-]\:)*[^\-][a-z0-9\_\-]*[^\-]$/i;
    if (!ns.match(nsPattern)) {
        throw new Error("Invalid ns value: " + ns);
    }
}
