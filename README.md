
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
  onUnexpectedFailure: function (err){ console.warn('WARNING: unexpected failure.  Details:',err); }
}).exec(function (err, report) {
  if (err) { console.error('UNEXPECTED ERROR:',err); return; }
  var mgr = report.manager;

  Pack.getConnection({
    manager: mgr
  }).exec(function (err, report) {
    if (err) { console.error('UNEXPECTED ERROR:',err); return; }

    console.log('CONNECTED!');

    // Now you can use the redis client however you like!
    //
    // To use the connection:
    // `report.connection`
    var redisClient = report.connection;
    //
    // See http://www.sitepoint.com/using-redis-node-js/ for more, but as a quick example:
    redisClient.set('stuff', 'things', function(err, reply) {
      // If "SET" failed...
      if (err) {
        // Handle failed "SET"
        // ...
        console.error('SET failed:',err);
        
        // Always release the connection when finished:
        Redis.releaseConnection({ connection: redisClient }).exec({
          error: function (err){ console.error('UNEXPECTED ERROR:',err); },
          success: function (report){ console.log('Connection released.'); }
        });
        return;
      }
    
      // Otherwise "SET" was successful.
      
      // Do stuff
      console.log('mmk set that.');
      // ....
      
      // Release the connection when finished:
      // (note that you can skip this step and just destroy the manager if you wish)
      Redis.releaseConnection({ connection: redisClient }).exec(function(err) {
        if (err) { console.error('UNEXPECTED ERROR:',err); return; }
        console.log('Connection released.');
        
        // But ALWAYS destroy the connection manager when finished
        Redis.destroyManager({ manager: mgr }).exec(function(err) {
          if (err) { console.error('UNEXPECTED ERROR:',err); return; }
          console.log('Done. (Manager destroyed)');
        });//</Redis.destroyManager>
      });//</Redis.releaseConnection>
    });//</client.set>
  });//</Redis.getConnection>
});//</Redis.createManager>
```


## About  &nbsp; [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/node-machine/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a [machinepack](http://node-machine.org/machinepacks), an NPM module which exposes a set of related Node.js [machines](http://node-machine.org/spec/machine) according to the [machinepack specification](http://node-machine.org/spec/machinepack).
Documentation pages for the machines contained in this module (as well as all other NPM-hosted machines for Node.js) are automatically generated and kept up-to-date on the <a href="http://node-machine.org" title="Public machine registry for Node.js">public registry</a>.
Learn more at <a href="http://node-machine.org/implementing/FAQ" title="Machine Project FAQ (for implementors)">http://node-machine.org/implementing/FAQ</a>.




## License

MIT &copy; 2015 contributors

