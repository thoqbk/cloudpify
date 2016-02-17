/**
 * Copyright (C) 2015, Cloudchat
 *
 * Released under the MIT license
 * Tho Q Luong, 00:04 June 22, 2015
 */

module.exports = Route;

var _ = require("underscore");

/**
 * 
 * @param {type} b isRootGroup
 * @param {type} rules
 * @param {type} filters
 * @returns {nm$_route.Route}
 */
function Route(b, rules, filters) {

    var isRootGroup = (b !== false);

    var beforeFx = null;
    var afterFx = null;

    var self = this;

    var allRules = [];
    var nameNFilterMap = {};
    var groups = [];

    if (rules != null) {
        allRules = rules;
    }

    if (filters != null) {
        nameNFilterMap = filters;
    }

    this.group = function () {
        if (!isRootGroup) {
            throw new Error("Can't create child group from other child group");
        }
        var retVal = new Route(false, allRules, filters);
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

    this.action = function (action, actionPath) {
        createRoutingRule(action, actionPath, self);
        return self;
    };

    this.filter = function (name, fx) {
        nameNFilterMap[name] = fx;
    };

    this.getAllRules = function () {
        return allRules;
    };

    this.getActionPath = function (action) {
        var rule = _.findWhere(allRules, {action: action});
        return rule == null ? null : rule.actionPath;
    };

    this.getGroup = function (action) {
        var rule = _.findWhere(allRules, {action: action});
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

    function createRoutingRule(action, actionPath, group) {
        var existedActionPath = _.findWhere(allRules, {actionPath: actionPath, action: action}) != null;
        if (existedActionPath) {
            throw new Error("Routing rule has already existed, action: " + action);
        }
        validateAction(action);
        allRules.push({
            action: action,
            actionPath: actionPath,
            group: group
        });
    }
}

function validateAction(action) {
    var nsPattern = /^([^\-][a-z0-9\_\-]*[^\-]\:)*[^\-][a-z0-9\_\-]*[^\-]$/i;
    if (!action.match(nsPattern)) {
        throw new Error("Invalid action value: " + action);
    }
}
