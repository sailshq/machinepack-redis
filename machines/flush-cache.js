module.exports = {


  friendlyName: 'Flush cache',


  description: 'Flush the cache, removing all data from it.',


  cacheable: true,


  inputs: {

    connection: {
      friendlyName: 'Connection',
      description: 'An active connection.',
      extendedDescription: 'The provided connection instance must still be active.  Only connection instances created by the `getConnection()` machine in the same driver are supported.',
      example: '===',
      required: true
    },

    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional metadata to pass to the driver.',
      extendedDescription: 'This input is not currently in use, but is reserved for driver-specific customizations in the future.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'Cache was successfully flushed.',
      outputVariableName: 'report',
      outputDescription: 'The return value is true when the cache was successfully flushed.',
      example: true
    },

    failed: {
      description: 'The cache encountered an error while attempting to flush the cache.',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance explaining the exact error.  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    },

    badConnection: require('../constants/badConnection.exit')

  },
  fn: function (inputs, exits) {
    var isFunction = require('lodash.isfunction');
    var isObject = require('lodash.isobject');

    // Ducktype provided "connection" (which is actually a redis client)
    if (!isObject(inputs.connection) || !isFunction(inputs.connection.end) || !isFunction(inputs.connection.removeAllListeners)) {
      return exits.badConnection();
    }

    // Provided `connection` is a redis client.
    var redisClient = inputs.connection;


    redisClient.flushdb(function (err, result) {
      if (err) {
        return exits.failed(err);
      }

      // Finally, call exits.success().
      // as per Redis docs, flushdb never fails and always return OK string
      // https://redis.io/commands/flushdb
      return exits.success(result === 'OK');

    });
  }


};
