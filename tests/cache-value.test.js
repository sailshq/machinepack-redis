/**
 * Module dependencies
 */

var Pack = require('../');
var shouldProperlyStoreValue = require('./helpers/should-properly-store-value.test-helper');



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
        connection: connection,
        key: 'test2',
        valueToStore: 'hello world'
      }, done);
    });//</it should properly a string value>


    it('should properly store a non-string value', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: 'test3',
        valueToStore: [
          {
            bar: 23,
            baz: 'agadsg'
          }
        ],
      }, done);
    });//</it should properly a non-string value>

    it('should properly store a number', function (done){
      // (e.g. if you store `4` it shouldn't end up as `'4'` when it is retrieved)
      shouldProperlyStoreValue({
        connection: connection,
        key: 'test4',
        valueToStore: 29
      }, done);
    });//</it>

    it('should properly store `null`', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: 'test5',
        valueToStore: null
      }, done);
    });//</it>

    it('should properly store `false`', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: 'test6',
        valueToStore: false
      }, done);
    });//</it>

    it('should properly store `0`', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: 'test7',
        valueToStore: 0
      }, done);
    });//</it>

    it('should properly store empty string (`\'\'`)', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: 'test8',
        valueToStore: ''
      }, done);
    });//</it>


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


