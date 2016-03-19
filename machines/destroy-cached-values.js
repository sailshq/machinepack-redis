module.exports = {
//
//
  friendlyName: 'Destroy cached values',
//
//
  description: 'Destroy the values stored under the specified keys.',
//
//
  inputs: {
//
    connection: {
      friendlyName: 'Connection',
      description: 'An active Redis connection.',
      extendedDescription: 'The provided Redis connection instance must still be active.  Only Redis connection instances created by the `getConnection()` machine in this driver are supported.',
      example: '===',
      required: true
    },
//
    keys: {
      friendlyName: 'Keys',
      description: 'An array of unique keys to delete.',
      extendedDescription: 'The case-sensitivity and allowable characters in keys may vary between drivers.',
      required: true,
      example: ['myNamespace.foo.bar_baz']
    },
//
    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional metadata to pass to the driver.',
      extendedDescription: 'This input is not currently in use, but is reserved for driver-specific customizations in the future.',
      example: '==='
    }
//
  },
//
//
  exits: {
//
    success: {
      outputVariableName: 'report',
      outputDescription: 'The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        meta: '==='
      }
    },
//    
    invalidKeys: {
      description: 'The keys parameter is not an array or has no keys.',
      outputVariableName: 'report',
      outputDescription: 'The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        meta: '==='
      }
    },
//    
    failed: {
      description: 'There was an error destroying a key.',
      extendedDescription: 'There was an error destroying a key.',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance explaining the exact error.  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    },
//
    badConnection: require('../constants/badConnection.exit')
//
  },
//
//
  fn: function (inputs, exits){
    var isFunction = require('lodash.isfunction');
    var isObject = require('lodash.isobject');
    var isArray = require('lodash.isarray');

    // Ducktype provided "connection" (which is actually a redis client)
    if (!isObject(inputs.connection) || !isFunction(inputs.connection.end) || !isFunction(inputs.connection.removeAllListeners)) {
      return exits.badConnection();
    }

    if (!isArray(inputs.keys) || (isArray(inputs.keys) && inputs.keys.length === 0)) {
      return exits.invalidKeys();
    }

    // Provided `connection` is a redis client.
    var redisClient = inputs.connection;

    redisClient.del(inputs.keys, function (err){
      if (err) {
        return exits.failed({error: new Error('There was an error deleting the keys passed. Details: ' + err.stack)});
      }
      return exits.success();
    });

  }

};
