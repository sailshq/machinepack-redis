/**
 * Module dependencies
 */

var util = require('util');
var isEqual = require('lodash.isequal');
var Pack = require('../');




/**
 * Note: These tests should ideally not be redis-specific.
 * (that way we can reuse them for any driver implementing the "cache" interface layer)
 */

describe('cacheValue()', function (){

  // Used to hold manager and active connection throughout the tests below.
  var manager;
  var connection;


  //  ┌┐ ┌─┐┌─┐┌─┐┬─┐┌─┐
  //  ├┴┐├┤ ├┤ │ │├┬┘├┤
  //  └─┘└─┘└  └─┘┴└─└─┘ooo
  //
  // Beforehand, create a manager and acquire an initial active
  // connection from it.
  before(function (done){
    Pack.createManager({
      connectionString: 'redis://127.0.0.1:6379'
    }).exec({
      error: done,
      success: function (report){
        // Save reference to manager.
        manager = report.manager;

        Pack.getConnection({
          manager: manager
        }).exec({
          error: done,
          success: function (report){
            // Save reference to connection.
            connection = report.connection;
            return done();
          }
        });
      }
    });
  });//</before>



  //  ╔╗ ╔═╗╔═╗╦╔═╗  ╦ ╦╔═╗╔═╗╔═╗╔═╗
  //  ╠╩╗╠═╣╚═╗║║    ║ ║╚═╗╠═╣║ ╦║╣
  //  ╚═╝╩ ╩╚═╝╩╚═╝  ╚═╝╚═╝╩ ╩╚═╝╚═╝
  describe('with basic usage', function(){


    it('should work', function (done){
      Pack.cacheValue({
        connection: connection,
        key: 'test1',
        value: [{bar: 23, baz: 'agadsg'}]
      }).exec(done);
    });//</it should work>


    it('should properly store a string value', function (done){
      shouldProperlyStoreValue({
        valueToStore: 'hello world',
        connection: connection
      }, done);
    });//</it should properly a string value>


    it('should properly store a non-string value', function (done){
      shouldProperlyStoreValue({
        valueToStore: [
          {
            bar: 23,
            baz: 'agadsg'
          }
        ],
        connection: connection
      }, done);
    });//</it should properly a non-string value>


    ////////////////////////////////////////////////////////////////////////////////
    // TODO: test that automatic expiry is happening
    // (e.g. using expiry of 1 second + setTimeout)
    ////////////////////////////////////////////////////////////////////////////////


  });//</with basic usage>




  //  ┌─┐┌─┐┌┬┐┌─┐┬─┐
  //  ├─┤├┤  │ ├┤ ├┬┘
  //  ┴ ┴└   ┴ └─┘┴└─ooo
  // Afterwards, destroy the manager
  // (which automatically releases any connections)
  after(function (done){
    Pack.destroyManager({
      manager: manager
    }).exec(done);
  });//</after>

});










/**
 * shouldProperlyStoreValue()
 *
 * Test helper for use within an `it()` block.
 *
 * @param  {Dictionary} opts
 *         @property  {===}   connection
 *         @property  {*}   valueToStore
 * @param  {Function} done
 */
function shouldProperlyStoreValue(opts, done){
  Pack.cacheValue({
    connection: opts.connection,
    key: 'test2',
    value: opts.valueToStore
  }).exec({
    error: done,
    success: function (){
      Pack.getCachedValue({
        connection: opts.connection,
        key: 'test2'
      }).exec({
        error: done,
        success: function (report){
          if (!isEqual(report.value, opts.valueToStore)) {
            return done(new Error('Incorrect value seems to have been stored (specifically, the value retrieved does not match value that was stored).  Expected:\n'+util.inspect(opts.valueToStore, {depth: null})+'\nBut got:\n'+util.inspect(report.value,{depth:null}) ));
          }
          return done();
        }
      });
    }
  });
}//</shouldProperlyStoreValue() helper>
