
<h1>
  <a href="http://node-machine.org" title="Node-Machine public registry"><img alt="node-machine logo" title="Node-Machine Project" src="http://node-machine.org/images/machine-anthropomorph-for-white-bg.png" width="50" /></a>
  machinepack-redis
</h1>

### [Docs](http://node-machine.org/machinepack-redis) &nbsp; [Browse other machines](http://node-machine.org/machinepacks) &nbsp;  [FAQ](http://node-machine.org/implementing/FAQ)  &nbsp;  [Newsgroup](https://groups.google.com/forum/?hl=en#!forum/node-machine)

Structured Node.js bindings for Redis.

> This package contains relatively low-level functionality, and it is designed to provide building blocks for higher-level abstractions (e.g. an ORM like Waterline).


## Installation &nbsp; [![NPM version](https://badge.fury.io/js/machinepack-redis.svg)](http://badge.fury.io/js/machinepack-redis) [![Build Status](https://travis-ci.org/treelinehq/machinepack-redis.svg?branch=master)](https://travis-ci.org/treelinehq/machinepack-redis)

```sh
$ npm install machinepack-redis --save
```


## Quick Start

The example in [examples/basic-usage.js](examples/basic-usage.js) contains a ready-to-use function useful for obtaining one-off access to a Redis connection.
Under the covers, in the function's implementation, you can see how to manage the Redis connection lifecycle, as well as how to implement thorough, production-level (anal-retentive) error handling.

> ##### Setup instructions for the example above
> 
> First, if your Redis server is not running yet, open a new terminal window and do:
> ```bash
> redis-server
> ```
> 
> Asuming that you cloned the module, you can just run the example:
>
> ```bash
> node examples/basic-usage.js
> ```



## Usage

For the latest usage documentation, version information, and test status of this module, see <a href="http://node-machine.org/machinepack-redis" title="Structured Node.js bindings for Redis. (for node.js)">http://node-machine.org/machinepack-redis</a>.  The generated manpages for each machine contain a complete reference of all expected inputs, possible exit states, and example return values.  If you need more help, or find a bug, jump into [Gitter](https://gitter.im/node-machine/general) or leave a message in the project [newsgroup](https://groups.google.com/forum/?hl=en#!forum/node-machine).


## About  &nbsp; [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/node-machine/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a [machinepack](http://node-machine.org/machinepacks), an NPM module which exposes a set of related Node.js [machines](http://node-machine.org/spec/machine) according to the [machinepack specification](http://node-machine.org/spec/machinepack).
Documentation pages for the machines contained in this module (as well as all other NPM-hosted machines for Node.js) are automatically generated and kept up-to-date on the <a href="http://node-machine.org" title="Public machine registry for Node.js">public registry</a>.
Learn more at <a href="http://node-machine.org/implementing/FAQ" title="Machine Project FAQ (for implementors)">http://node-machine.org/implementing/FAQ</a>.


## License

MIT &copy; 2015, 2016 contributors

