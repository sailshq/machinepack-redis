/**
 * Module dependencies
 */

var Pack = require('../');
var shouldProperlyStoreValue = require('./helpers/should-properly-store-value.test-helper');

/**
 * Note: These tests should ideally not be redis-specific.
 * (that way we can reuse them for any driver implementing the "cache" interface layer)
 */

describe('flushCache()', function (){

  // Used to hold manager and active connection throughout the tests below.
  var manager;
  var connection;

  //                                               _   _
  //                                              | | (_)
  // _ __   ___     ___ ___  _ __  _ __   ___  ___| |_ _  ___  _ __
  //| '_ \ / _ \   / __/ _ \| '_ \| '_ \ / _ \/ __| __| |/ _ \| '_ \
  //| | | | (_) | | (_| (_) | | | | | | |  __/ (__| |_| | (_) | | | |
  //|_| |_|\___/   \___\___/|_| |_|_| |_|\___|\___|\__|_|\___/|_| |_|
  //
  describe('with no connection', function (){
    it('should fail', function (done){
      Pack.flushCache({
        connection: {}
      }).exec({
        error: done,
        badConnection: function (){
          return done();
        },
        success: function (){
          return done(new Error('Expecting `badConnection` exit'));
        }
      });
    });
  });


  //  ╔╗ ╔═╗╔═╗╦╔═╗  ╦ ╦╔═╗╔═╗╔═╗╔═╗
  //  ╠╩╗╠═╣╚═╗║║    ║ ║╚═╗╠═╣║ ╦║╣
  //  ╚═╝╩ ╩╚═╝╩╚═╝  ╚═╝╚═╝╩ ╩╚═╝╚═╝
  describe('with connection', function (){

    it('should work', function (done){
      Pack.createManager({
        // 15 = non standard database for the unit tests
        connectionString: 'redis://127.0.0.1:6379/15',
        meta: {
          password: 'qwer1234'
        }
      }).exec({
        error: function (err){
          done(new Error(JSON.stringify(err)));
        },
        success: function (report){
          // Save reference to manager.
          manager = report.manager;
          Pack.getConnection({
            manager: manager
          }).exec({
            error: function (err){
              done(new Error(JSON.stringify(err)));
            },
            failed: function (err){
              done(new Error(JSON.stringify(err)));
            },
            success: function (report){
              // Save reference to connection.
              connection = report.connection;
              Pack.flushCache({
                connection: connection,
                meta: {
                  db: 15 // non standard database for the unit tests
                }
              }).exec(done);
            }
          });
        }
      });
    }); //</it should work>

  }); //</with connection>

});


