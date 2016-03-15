/**
 * Module dependencies
 */

var Pack = require('../');
var isEqual = require('lodash.isequal');




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
      success: function (_mgr){
        // Save reference to manager.
        manager = _mgr;

        Pack.getConnection({
          manager: manager
        }).exec({
          error: done,
          success: function (_conn){
            // Save reference to connection.
            connection = _conn;
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


    it('should properly store things', function (done){

      var VAL_TO_STORE = [{
        bar: 23,
        baz: 'agadsg'
      }];

      Pack.cacheValue({
        connection: connection,
        key: 'test2',
        value: VAL_TO_STORE
      }).exec({
        error: done,
        success: function (){
          Pack.getCachedValue({
            connection: connection,
            key: 'test2'
          }).exec({
            error: done,
            success: function (foundValue){
              if (isEqual(foundValue, VAL_TO_STORE)) {
                return done(new Error('Incorrect value seems to have been stored (specifically, the value retrieved does not match value that was stored).'));
              }
              return done();
            }
          });
        }
      });
    });//</it should properly store things>


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

