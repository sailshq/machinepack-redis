module.exports = {


  friendlyName: 'Get cached value',


  description: 'Look up the cached value associated with the specified key.',


  cacheable: true,


  inputs: {

    connection: {
      friendlyName: 'Connection',
      description: 'An active Redis connection.',
      extendedDescription: 'The provided Redis connection instance must still be active.  Only Redis connection instances created by the `getConnection()` machine in this driver are supported.',
      example: '===',
      required: true
    },

    key: {
      friendlyName: 'Key',
      description: 'The unique key to look up.',
      extendedDescription: 'The case-sensitivity and allowable characters in keys may vary between drivers.',
      required: true,
      example: 'myNamespace.foo.bar_baz'
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
      description: 'Value was sucessfully fetched.',
      outputVariableName: 'report',
      outputDescription: 'The `value` property is the cached value that was just retrieved.  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        value: '*',
        meta: '==='
      }
    },

    notFound: {
      description: 'No value exists under the specified key.',
      outputVariableName: 'report',
      outputDescription: 'The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        meta: '==='
      }
    },

    badConnection: require('../constants/badConnection.exit')

  },


  fn: function(inputs, exits) {
    var isFunction = require('lodash.isfunction');
    var isObject = require('lodash.isobject');

    // Ducktype provided "connection" (which is actually a redis client)
    if ( !isObject(inputs.connection) || !isFunction(inputs.connection.end) || !isFunction(inputs.connection.removeAllListeners) ) {
      return exits.badConnection();
    }

    // Provided `connection` is a redis client.
    var redisClient = inputs.connection;

    // TODO: run a "GET" and if something is found, call exits.success()
    //        (if nothing is found, call exits.notFound())
    return exits.error(new Error('TODO'));
  },



};
