/**
 * Module dependencies
 */
var Redis = require('machinepack-redis');

Redis.createManager({
  connectionString: 'redis://127.0.0.1:6379',
  onUnexpectedFailure: function (err){
    console.warn('WARNING: unexpected failure.  Details:', err);
  }
}).exec(function (err, report){
  if (err) {
    console.error('UNEXPECTED ERROR:', err);
    return;
  }
  var mgr = report.manager;
  Redis.getConnection({
    manager: mgr
  }).exec(function (err, report){
    if (err) {
      console.error('UNEXPECTED ERROR:', err);
      return;
    }
    var connection = report.connection;
    console.log('CONNECTED!');

    // Storing in key `stuff` value `things`
    Redis.cacheValue({
      connection: connection,
      key: 'stuff',
      value: 'things'
    }).exec(function (err, report){
      if (err) {
        console.error('UNEXPECTED ERROR:', err);
        return;
      }

      console.log('stored `stuff` key with `things`');

      // Get the cached value back
      Redis.getCachedValue({
        connection: connection,
        key: 'stuff'
      }).exec(function (err, report){

        if (err) {
          console.error('UNEXPECTED ERROR:', err);
          return;
        }

        console.log('stuff `key` contains `%s`', report.value);

        // remove keys. Notice that keys is an array of keys to remove
        Redis.destroyCachedValues({
          connection: connection,
          keys: ['stuff']
        }).exec(function (err, report){

          if (err) {
            console.error('UNEXPECTED ERROR:', err);
            return;
          }

          console.log('key `stuff` removed');

          // Get the cached value back
          Redis.getCachedValue({
            connection: connection,
            key: 'stuff'
          }).exec({
            error: function (err){
              console.error('UNEXPECTED ERROR:', err);
              return;
            },
            notFound: function (){
              console.log('keys `stuff` not found');

              // Always release the connection when finished:
              Redis.releaseConnection({
                connection: connection
              }).exec({
                error: function (err){
                  console.error('UNEXPECTED ERROR:', err);
                },
                success: function (report){
                  console.log('Connection released.');

                  // But ALWAYS destroy the connection manager when finished
                  Redis.destroyManager({manager: mgr}).exec(function (err){
                    if (err) {
                      console.error('UNEXPECTED ERROR:', err);
                      return;
                    }
                    console.log('Done. (Manager destroyed)');
                  }); //</Redis.destroyManager>

                }
              });
            },
            success: function (){
              console.error('Should not find the key!');
            }
          }); //</Redis.getCachedValue>

        }); //</Redis.destroyCachedValues>
      }); //</Redis.getCachedValue>
    }); //</Redis.cacheValue>
  }); //</Redis.getConnection>
}); //</Redis.createManager>
