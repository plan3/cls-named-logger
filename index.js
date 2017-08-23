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

const clsLog = function(debugFnc, clsNs, ...msg) {
    if (clsNs.active && typeof clsNs.active === 'object') {
        Object.keys(clsNs.active).forEach((key) => {
            const val = clsNs.active[key];
            msg[0] += ` [${key}=${val}]`;
        });
    }
    debugFnc(...msg);
};

const validateNs = (ns) => {
    if (ns) {
        if (typeof ns !== 'object' || (ns.active !== null && typeof ns.active !== 'object')) {
            throw new Error('Passed namespace should be a CLS namespace object');
        }
    }
};

/**
 * @param {Object} clsNs Continuation local storage namespace
 * @returns {DebugLogger}
 */
module.exports = function(clsNs) {
    if (clsNs) {
        validateNs(clsNs);
    } else {
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
