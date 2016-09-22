
<h1>
  <a href="http://node-machine.org" title="Node-Machine public registry"><img alt="node-machine logo" title="Node-Machine Project" src="http://node-machine.org/images/machine-anthropomorph-for-white-bg.png" width="50" /></a>
  machinepack-redis
</h1>

### [Docs](http://node-machine.org/machinepack-redis) &nbsp; [Browse other machines](http://node-machine.org/machinepacks) &nbsp;  [FAQ](http://node-machine.org/implementing/FAQ)  &nbsp;  [Newsgroup](https://groups.google.com/forum/?hl=en#!forum/node-machine)

Structured Node.js bindings for Redis.


## Installation &nbsp; [![NPM version](https://badge.fury.io/js/machinepack-redis.svg)](http://badge.fury.io/js/machinepack-redis) [![Build Status](https://travis-ci.org/mikermcneil/machinepack-redis.png?branch=master)](https://travis-ci.org/mikermcneil/machinepack-redis)

```sh
$ npm install machinepack-redis --save --save-exact
```

## Usage

For the latest usage documentation, version information, and test status of this module, see <a href="http://node-machine.org/machinepack-redis" title="Structured Node.js bindings for Redis. (for node.js)">http://node-machine.org/machinepack-redis</a>.  The generated manpages for each machine contain a complete reference of all expected inputs, possible exit states, and example return values.  If you need more help, or find a bug, jump into [Gitter](https://gitter.im/node-machine/general) or leave a message in the project [newsgroup](https://groups.google.com/forum/?hl=en#!forum/node-machine).


## Quick Start

> ##### To run this example
>
> First, if your Redis server is not running yet, open a new terminal window and do:
> ```bash
> redis-server
> ```
> 
> Next, copy the example code below to a new `.js` file somewhere in your project (e.g. `examples/basic-usage.js`).
> Then run:
> ```bash
> npm install machinepack-redis --save --save-exact
> ```
>
>
> Finally, run the example:
> ```bash
> node examples/basic-usage.js
> ```



```javascript

/**
 * Module dependencies
 */
var Redis = require('machinepack-redis');

Redis.createManager({
  connectionString: 'redis://127.0.0.1:6379',
  onUnexpectedFailure: function (err){
    console.warn('WARNING: Redis manager emitted a notice about an unexpected failure.  The redis server may have crashed, or become inaccessible.  Error details from Redis:', err);
  }
}).exec(function (err, report){
  if (err) {
    console.error(new Error('Could not create manager due to unexpected error: '+ err.stack));
    return;
  }//--• No reason to proceed any further.
  
  var mgr = report.manager;
  Redis.getConnection({
    manager: mgr
  }).exec(function (err, report){
    if (err) {
      console.error(new Error('Could not get connection from manager, due to unexpected error: '+err.stack));
      return;
    }//--• No reason to proceed any further.
    
    var connection = report.connection;
    console.log('CONNECTED!');
    
    // Now do stuff w/ the connection
    (function during(done){
      
      // Storing in key `stuff` value `things`
      Redis.cacheValue({
        connection: connection,
        key: 'stuff',
        value: 'things'
      }).exec(function (err, report){
        if (err) {
          return done(new Error('Could not cache value, due to unexpected error.  Error details: '+err.stack));
        }
  
        console.log('stored `stuff` key with `things`');
  
        // Get the cached value back
        Redis.getCachedValue({
          connection: connection,
          key: 'stuff'
        }).exec(function (err, report){
          if (err) {
            return done(new Error('Could not get cached value, due to unexpected error.  Error details:', err.stack));
          }
  
          console.log('stuff `key` contains `%s`', report.value);
  
          // remove keys. Notice that keys is an array of keys to remove
          Redis.destroyCachedValues({
            connection: connection,
            keys: ['stuff']
          }).exec(function (err, report){
            if (err) {
              return done(new Error('Could not get destroy cached values, due to unexpected error.  Error details:', err.stack));
            }
  
            console.log('key `stuff` removed');
  
            // Get the cached value back
            Redis.getCachedValue({
              connection: connection,
              key: 'stuff'
            }).exec({
              error: function (err){
                return done(new Error('Could not get cached value the 2nd time, due to unexpected error.  Error details:', err.stack));
              },
              notFound: function (){
                console.log('As we expected, the `stuff` key was not found this time.  Good!');
                return done();
              },
              success: function (){
                return done(new Error('Consistency violation: Should not have been able to find `stuff` key the 2nd time!!!  Must be a bug in our code.'));
              }
            }); //</Redis.getCachedValue>
  
          }); //</Redis.destroyCachedValues>
        }); //</Redis.getCachedValue>
      }); //</Redis.cacheValue>
    })(function afterwards (err) {
      if (err) {
        console.log('Unexpected error occurred while doing stuff with this Redis connection.  Details: '+err.stack);
        console.log('Nonetheless, continuing on to release the connection and destroy the manager....');
      }// >- continue on to attempt to release the connection and destroy the manager.
      
      // Always release the connection when finished:
      Redis.releaseConnection({
        connection: connection
      }).exec({
        error: function (err){
          console.error('Could not release Redis connection due to unexpected error:', err);
          // Note that we might want to also still attempt to destroy the manager even
          // though we couldn't release the connection. (although we don't in this example)
        },
        success: function (report){
          console.log('Connection released.');

          // But ALWAYS destroy the connection manager when finished
          Redis.destroyManager({manager: mgr}).exec(function (err){
            if (err) {
              console.error('Could not destroy Redis connection manager due to unexpected error:', err);
              return;
            }
            
            console.log('Done. (Manager destroyed)');
            
          }); //</Redis.destroyManager>

        }//</on success :: Redis.releaseConnection()>
      });//</Redis.releaseConnection()>
    });//</self-calling function :: do stuff while redis connection is active>
  }); //</Redis.getConnection>
}); //</Redis.createManager>

```


## About  &nbsp; [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/node-machine/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a [machinepack](http://node-machine.org/machinepacks), an NPM module which exposes a set of related Node.js [machines](http://node-machine.org/spec/machine) according to the [machinepack specification](http://node-machine.org/spec/machinepack).
Documentation pages for the machines contained in this module (as well as all other NPM-hosted machines for Node.js) are automatically generated and kept up-to-date on the <a href="http://node-machine.org" title="Public machine registry for Node.js">public registry</a>.
Learn more at <a href="http://node-machine.org/implementing/FAQ" title="Machine Project FAQ (for implementors)">http://node-machine.org/implementing/FAQ</a>.




## License

MIT &copy; 2015 contributors

