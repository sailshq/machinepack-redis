module.exports = {
//
//
  friendlyName: 'Cache value',
//
//
  description: 'Cache a value using the specified key.',
//
//
  extendedDescription: 'If a `ttl` ("time-to-live") timeout is specified, the key will be deleted automatically after the specified number of seconds.',
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
    key: {
      friendlyName: 'Key',
      description: 'The unique key under which this value should be stored.',
      extendedDescription: 'The case-sensitivity and allowable characters in keys may vary between drivers.',
      required: true,
      example: 'myNamespace.foo.bar_baz'
    },
//
    value: {
      friendlyName: 'Value',
      description: 'The value to cache.',
      extendedDescription: 'Must be JSON-serializable-- that is, a string, number, boolean, dictionary, array, or `null`.  If a dictionary or array, must contain exclusively JSON-serializable contents.',
      required: true,
      example: '*'
    },
//
    ttl: {
      friendlyName: 'Time-to-live (TTL)',
      description: 'The number of seconds to store this value before automatically deleting it.',
      extendedDescription: 'For example, to keep the value cached for 24 hours, use `86400` (24 hours * 60 minutes * 60 seconds).  If `ttl` is left unspecified, the key will not be deleted automatically-- i.e. it will be cached _forever_.',
      example: 86400
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
      description: 'Value was sucessfully written.',
      outputVariableName: 'report',
      outputDescription: 'The `meta` property is reserved for custom driver-specific extensions.',
      example: {
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
    var isNumber = require('lodash.isnumber');

    // Ducktype provided "connection" (which is actually a redis client)
    if (!isObject(inputs.connection) || !isFunction(inputs.connection.end) || !isFunction(inputs.connection.removeAllListeners)) {
      return exits.badConnection();
    }

    // Provided `connection` is a redis client.
    var redisClient = inputs.connection;

    // Redis expects string values.
    //
    // So JSON.stringify _EVERYTHING_, even if the value is already
    // a string. This is important because otherwise it is very error-prone
    // to figure out (on the way back out) whether or not something was
    // originally a string.
    //
    // Optimizations here are possible in the future (see `rttc.stringifyHuman()`)
    // but probably not a good idea right now.
    inputs.value = JSON.stringify(inputs.value);

    // Set up the redis set callback that will be used by both set or setex
    var redisSetCallback = function (err){
      if (err) {
        return exits.error(err);
      }
      return exits.success();
    };

    // If a TTL is set and its greater than zero, use SETEX as it is atomic
    // and is the equivalent of:
    // * SET mykey value
    // * EXPIRE mykey seconds
    // http://redis.io/commands/setex
    if (isNumber(inputs.ttl) && inputs.ttl > 0) {
      redisClient.setex(inputs.key, inputs.ttl, inputs.value, redisSetCallback);
    } else {
      redisClient.set(inputs.key, inputs.value, redisSetCallback);
    }

  }
};

