"use strict";

/**
 * @module utils
 * @author Wouter Van den Broeck
 * @copyright 2016
 */

// -------------------------------------------------------------------------------------------------

const _extend = require('util')._extend;

/**
 * Clones the given object.
 * @param obj
 * @param deep
 */
exports.clone = function (obj, deep) {
    if (deep) { return JSON.parse(JSON.stringify(obj)); }
    else { return _extend({}, obj); }
};

// -------------------------------------------------------------------------------------------------

/**
 * Pretty formats XML.
 * Based on {@link https://gist.github.com/kurtsson/3f1c8efc0ccd549c9e31}
 * @param {XML|string} xml
 * @returns {string}
 */
exports.formatXml = function (xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    if (typeof xml != 'string') { xml.toString(); }
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    var nodes = xml.split('\r\n');
    for(var n in nodes) {
        var node = nodes[n];
        var indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    }
    //return formatted.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g, '&nbsp;');
    return formatted;
};

// -------------------------------------------------------------------------------------------------
