module.exports = {


  friendlyName: 'Get connection',


  description: 'Get an active connection to Redis.',


  inputs: {

     manager: {
      friendlyName: 'Manager',
      description: 'The connection manager instance to acquire the connection from.',
      extendedDescription:
        'Only managers built using the `createManager()` method of this driver are supported. '+
        'Also, the database connection manager instance provided must not have been destroyed--'+
        'i.e. once `destroyManager()` is called on a manager, no more connections can be acquired '+
        'from it (also note that all existing connections become inactive-- see `destroyManager()` '+
        'for more on that).',
      example: '===',
      required: true
    },

    meta: {
      friendlyName: 'Meta (custom)',
      description: 'Additional stuff to pass to the driver.',
      extendedDescription: 'This is reserved for custom driver-specific extensions.  Please refer to the documentation for the driver you are using for more specific information.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'A connection was successfully acquired.',
      extendedDescription: 'This connection should be eventually released.  Otherwise, it may time out.  It is not a good idea to rely on database connections timing out-- be sure to release this connection when finished with it!',
      outputVariableName: 'report',
      outputDescription: 'The `connection` property is an active connection to the database.  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        connection: '===',
        meta: '==='
      }
    },

    failed: {
      description: 'Could not acquire a connection to the database using the specified manager.',
      extendedDescription: 'This might mean any of the following:\n'+
      ' + the credentials encoded in the connection string are incorrect\n'+
      ' + there is no database server running at the provided host (i.e. even if it is just that the database process needs to be started)\n'+
      ' + there is no software "database" with the specified name running on the server\n'+
      ' + the provided connection string does not have necessary access rights for the specified software "database"\n'+
      ' + this Node.js process could not connect to the database, perhaps because of firewall/proxy settings\n'+
      ' + any other miscellaneous connection error',
      outputVariableName: 'report',
      outputDescription: 'The `error` property is a JavaScript Error instance explaining that a connection could not be made.  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        error: '===',
        meta: '==='
      }
    }

  },


  fn: function (inputs, exits) {
    var util = require('util');
    var redis = require('redis');

    // Build a local variable (`redisClientOptions`) to house a dictionary
    // of additional Redis client options that will be passed into createClient().
    // (this is pulled from the `meta` maanger)
    //
    // For a complete list of available options, see:
    //  • https://github.com/NodeRedis/node_redis#options-is-an-object-with-the-following-possible-properties
    var redisClientOptions = inputs.manager.meta || undefined;

    // Create Redis client
    var client;
    try {
      client = redis.createClient(inputs.manager.connectionString, redisClientOptions);
    }
    catch (e) {
      // If a "TypeError" was thrown, it means something was wrong with
      // one of the provided client options.  We assume the issue was with
      // the connection string, since this is the case 99% of the time.
      // Of course, the actual error is passed through, so it's possible to
      // tell what's going on if this is a data-type error related to some
      // other custom option passed in via `meta`.
      if (e.name === 'TypeError') {
        return exits.failed({ error: new Error('Invalid Redis client options in manager. Details: '+e.stack) });
      }
      return exits.failed({ error: e });
    }

    ////////////////////////////////////////////////////////////////////////
    // These two functions (`onPreConnectionError`, `onPreConnectionEnd`)
    // have to be defined ahead of time (otherwise, they are not in scope
    // from within each other's implementations; and so cannot be used as
    // the second argument to `removeListener()`)
    var redisConnectionError;
    function onPreConnectionError (err){
      redisConnectionError = err;
    }
    function onPreConnectionEnd(){
      client.removeListener('end', onPreConnectionEnd);
      client.removeListener('error', onPreConnectionError);

      // Prevent automatic reconnection attempts.
      client.end(true);

      return exits.failed({
        error: redisConnectionError || new Error('Redis client fired "end" event before it finished connecting.')
      });
    }
    ////////////////////////////////////////////////////////////////////////

    // Bind an "error" listener so that we can track errors that occur
    // during the connection process.
    client.on('error', onPreConnectionError);

    // Bind an "end" listener in case the client "ends" before
    // it successfully connects...
    client.on('end', onPreConnectionEnd);

    // Bind a "ready" listener so that we know when the client has connected.
    client.once('ready', function onConnectionReady(){
      client.removeListener('end', onPreConnectionEnd);
      client.removeListener('error', onPreConnectionError);

      // Bind "error" handler to prevent crashing the process if error events
      // are emitted later on (e.g. if the Redis server crashes or the connection
      // is lost for any other reason).
      // See https://github.com/mikermcneil/waterline-query-builder/blob/master/docs/errors.md#when-a-connection-is-interrupted
      client.on('error', function onIntraConnectionError(err){
        // If manager was not provisioned with an `onUnexpectedFailure`,
        // we'll just handle this error event silently (to prevent crashing).
        if (!util.isFunction(inputs.manager.onUnexpectedFailure)) { return; }

        if (err) {
          if (/ECONNREFUSED/g.test(err)) {
            inputs.manager.onUnexpectedFailure(new Error(
              'Error emitted from Redis client: Connection to Redis server was lost (ECONNREFUSED). '+
              'Waiting for Redis client to come back online (if configured to do so, auto-reconnecting behavior '+
              'is happening in the background). Currently there are '+client.connections+' underlying Redis connections.\n'+
              'Error details:'+err.stack
            ));
          }
          else {
            inputs.manager.onUnexpectedFailure(new Error('Error emitted from Redis client.\nError details:'+err.stack));
          }
        }
        else {
          inputs.manager.onUnexpectedFailure(new Error('Error emitted from Redis client.\n (no other information available)'));
        }
      });

      // Now track this Redis client as one of the "redisClients" on our manager
      // (since we want to be able to call destroyManager to wipe them all)
      inputs.manager.redisClients.push(client);

      // Save a reference to our manager instance on the redis client.
      if (client._fromWLManager){
        return exits.error('Consistency violation: Somehow, a `_fromWLManager` key already exists on this Redis client instance!');
      }
      client._fromWLManager = inputs.manager;

      // Finally, send back the Redis client as our active "connection".
      return exits.success({
        connection: client
      });
    });

  }


};
