# CLS Named Logger [![Build Status](https://travis-ci.org/plan3/cls-named-logger.svg?branch=master)](https://travis-ci.org/plan3/cls-named-logger)

## Installtion

`npm install cls-named-logger`

## Usage

```javascript
const loggerFactory = require('cls-named-logger')();
const logger = loggerFactory('debug:namespace');

const clsNamespace = loggerFactory.clsNs;

clsNamespace.run(function() {
    clsNamespace.set('customArg', 123);
    logger.log('Some message');
});
```

or

```javascript
const cls = require('continuation-local-storage');
const clsNamedLogger = require('cls-named-logger');

const clsNamespace = cls.createNamespace(clsNamespaceName);
const logger = clsNamedLogger(clsNamespace)('debug:namespace');

clsNamespace.run(function() {
    clsNamespace.set('customArg', 123);
    logger.log('Some message');
});
```

It will append custom CLS namespace values to the end of the message. In :point-up: example it will be:

`Some message [customArg=123]`
