/**
 * Module dependencies
 */

var Pack = require('../');



/**
 * Note: These tests should ideally not be redis-specific.
 * (that way we can reuse them for any driver implementing the "cache" interface layer)
 */

describe('getCachedValue()', function (){

  // Used to hold manager and active connection throughout the tests below.
  var manager;
  var connection;


  // The keys to use during tests.
  var keysUsed = ['test1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8'];


  //  ┌┐ ┌─┐┌─┐┌─┐┬─┐┌─┐
  //  ├┴┐├┤ ├┤ │ │├┬┘├┤
  //  └─┘└─┘└  └─┘┴└─└─┘ooo
  //
  // Beforehand, create a manager and acquire an initial active
  // connection from it.  Also delete the specified keys, just to be safe.
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

            // Now delete keys just to be safe.
            Pack.destroyCachedValues({
              connection: connection,
              keys: keysUsed
            }).exec(done);
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
        key: keysUsed[0],
        value: 'whatever'
      }).exec({
        error: done,
        success: function(){
          Pack.getCachedValue({
            connection: connection,
            key: keysUsed[0]
          }).exec(done);
        }
      });
    });//</it should work>


    it('should exit `notFound` if key does not exist', function (done){
      Pack.getCachedValue({
        connection: connection,
        key: keysUsed[1]
      }).exec({
        error: done,
        notFound: function (){
          return done();
        },
        success: function (){
          return done(new Error('Expecting `notFound` exit'));
        }
      });
    });//</it should exit `notFound` if key does not exist>

    ////////////////////////////////////////////////////////////////////////////////
    // TODO: test that it functions properly in the case where >=1 but NOT ALL of
    //       the specified keys actually exist.
    ////////////////////////////////////////////////////////////////////////////////


  });//</with basic usage>




  //  ┌─┐┌─┐┌┬┐┌─┐┬─┐
  //  ├─┤├┤  │ ├┤ ├┬┘
  //  ┴ ┴└   ┴ └─┘┴└─ooo
  // Afterwards, destroy the keys that were set, and then also destroy the manager
  // (which automatically releases any connections).
  after(function (done){
    Pack.destroyCachedValues({
      connection: connection,
      keys: keysUsed
    }).exec(function (err){
      // If there is an error deleting keys, log it but don't stop
      // (we need to be sure and destroy the manager)
      if (err) {
        console.error('ERROR: Could not destroy keys in test cleanup.  Details:\n',err);
      }
      Pack.destroyManager({
        manager: manager
      }).exec(done);
    });
  });//</after>

});


