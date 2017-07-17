'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');
const debug = require('debug');

const messages = [];
function logInterceptor() {
    messages.push(arguments);
}

logInterceptor.get = function() {
    return messages;
};

logInterceptor.reset = function() {
    messages.splice(0);
};

debug.log = logInterceptor;

describe('CLS Named Logger tests', function() {
    it('creates it\'s own namespace if none provided', function() {
        const loggerFactory = require('../index');
        const logger = loggerFactory();

        assert(typeof logger.clsNs === 'object');
    });

    it('initialized properly even if bluebird is not installed', function() {
        const loggerFactory = proxyquire('../index', { bluebird: null });
        const logger = loggerFactory();

        assert(typeof logger.clsNs === 'object');
    });

    it('logs messages while appending custom CLS values', function() {
        const loggerFactory = require('../index')();
        const logger = loggerFactory('something');

        const clsNamespace = loggerFactory.clsNs;

        clsNamespace.run(function() {
            clsNamespace.set('customArg', 123);
            logger.log('Some message');
        });

        assert(logInterceptor.get()[0][0].match(/Some message \[customArg=123\]$/));
    });
});

