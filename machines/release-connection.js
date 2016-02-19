module.exports = {


  friendlyName: 'Release connection',


  description: 'Close an active connection to the Redis server.',


  moreInfoUrl: 'https://github.com/NodeRedis/node_redis#clientendflush',


  inputs: {

    connection: {
      friendlyName: 'Connection',
      description: 'An active Redis connection.',
      extendedDescription: 'The provided Redis connection instance must still be active.  Only Redis connection instances created by the `getConnection()` machine in this driver are supported.',
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
      description: 'The connection was released and is no longer active.',
      extendedDescription: 'The provided connection may no longer be used for any subsequent queries.',
      outputVariableName: 'report',
      outputDescription: 'The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        meta: '==='
      }
    },

    badConnection: {
      friendlyName: 'Bad connection',
      description: 'The provided connection is not valid or is no longer active.  Are you sure it was obtained by calling this driver\'s `getConnection()` method?',
      extendedDescription: 'This could mean the connection to the database was lost due to a logic error or timing issue in userland code.  In production, this can mean that the database became overwhelemed or was shut off while some business logic was in progress.',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance containing the raw error from the database.  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    }

  },


  fn: function (inputs, exits) {
    var util = require('util');

    // Validate provided connection.
    if ( !util.isObject(inputs.connection) || !util.isFunction(inputs.connection.end) || !util.isFunction(inputs.connection.removeAllListeners) ) {
      return exits.badConnection();
    }

    // Release connection.
    try {
      inputs.connection.end(true);
      inputs.connection.removeAllListeners();
    }
    catch (e) {
      return exits.error(e);
    }

    return exits.success();
  }


};
