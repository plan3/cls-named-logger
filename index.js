'use strict';

const cls = require('continuation-local-storage');
const clsBluebird = require('cls-bluebird');
const debugFactory = require('debug');

const logLevels = ['log', 'info', 'debug', 'trace', 'warn', 'error'];

let Bluebird;
try {
    Bluebird = require('bluebird');
} catch (err) {
    // omit errors
}

function patchBluebird(clsNamespace) {
    if (Bluebird) {
        clsBluebird(clsNamespace);
    }
}

function prepareNamespace(clsNamespaceName) {
    const clsNamespace = cls.createNamespace(clsNamespaceName);
    patchBluebird(clsNamespace);

    return clsNamespace;
}

const DEFAULT_NAMESPACE_NAME = 'cls';
let defaultNamespace = null;
const getDefaultNamespace = function() {
    if (defaultNamespace === null) {
        defaultNamespace = prepareNamespace(DEFAULT_NAMESPACE_NAME);
    }
    return defaultNamespace;
};

/**
 * @typedef {Object} Logger
 * @property {Function} log
 * @property {Function} info
 * @property {Function} debug
 * @property {Function} trace
 * @property {Function} warn
 * @property {Function} error
 */

/**
 * @typedef {Function} DebugLogger
 * @param {string} debugNs
 * @property {Object} clsNs
 * @returns {Logger}
 */

/**
 * @param {Function} debugFnc
 * @param {Object} clsNs
 * @param {...string} msg
 */
const clsLog = function(debugFnc, clsNs, ...msg) {
    if (clsNs.active && typeof clsNs.active === 'object') {
        Object.keys(clsNs.active).forEach((key) => {
            const val = clsNs.active[key];
            msg[0] += ` [${key}=${val}]`;
        });
    }
    debugFnc(...msg);
};

/**
 * @param {Object} clsNs Continuation local storage namespace
 * @returns {DebugLogger}
 */
module.exports = function(clsNs) {
    if (typeof clsNs !== 'object' || clsNs === null) {
        clsNs = getDefaultNamespace();
    }
    const logger = function(debugNs) {
        const debugFnc = debugFactory(debugNs);
        const loggerObj = {};
        logLevels.forEach((level) => {
            loggerObj[level] = clsLog.bind(null, debugFnc, clsNs);
        });
        return loggerObj;
    };
    logger.clsNs = clsNs;
    return logger;
};
