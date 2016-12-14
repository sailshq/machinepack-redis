/**
 * Module dependencies
 */

var Pack = require('../');
var shouldProperlyStoreValue = require('./helpers/should-properly-store-value.test-helper');


/**
 * Note: These tests should ideally not be redis-specific.
 * (that way we can reuse them for any driver implementing the "cache" interface layer)
 */

describe('getConnection()', function (){

  //  ╔╗ ╔═╗╔═╗╦╔═╗  ╦ ╦╔═╗╔═╗╔═╗╔═╗
  //  ╠╩╗╠═╣╚═╗║║    ║ ║╚═╗╠═╣║ ╦║╣
  //  ╚═╝╩ ╩╚═╝╩╚═╝  ╚═╝╚═╝╩ ╩╚═╝╚═╝
  describe('with basic usage', function (){

    it('should connect with a password', function (done){
      Pack.createManager({
        // 15 = non standard database for the unit tests
        connectionString: 'redis://127.0.0.1:6379/15'
      }).exec({
        error: done,
        success: function (result){
          // Save reference to manager.
          var manager = result.manager;
          Pack.getConnection({
            manager: manager
          }).exec({
            error: function (err){
              done(new Error(JSON.stringify(err)));
            },
            failed: function (err){
              done(new Error(JSON.stringify(err)));
            },
            success: function (){
              done();
            }
          });
        }
      });
    }); //</should connect with a password>

    it('should fail to connect to an invalid port', function (done){
      Pack.createManager({
        // 15 = non standard database for the unit tests
        connectionString: 'redis://127.0.0.1:9999/15',
        meta: {
          connect_timeout: 1000,
          retry_strategy: function (){
            return null;
          }
        }
      }).exec({
        error: done,
        success: function (result){
          Pack.getConnection({
            manager: result.manager
          }).exec({
            error: done,
            failed: function (){
              done();
            },
            success: function (){
              done(new Error('should fail to connect to an invalid port'));
            }
          });
        }
      });
    }); //</should connect with a password>


  }); //</with basic usage>

});


