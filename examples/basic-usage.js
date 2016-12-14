/**
 * Module dependencies
 */
var Redis = require('../');


/**
 * doSomeStuffWithRedis()
 *
 * An example of a helper function you might write using mp-redis.
 *
 * @required {String} connectionString
 *   Connection string to use when connecting to Redis.
 *
 * @optional {Function} during
 *   Lifecycle callback to run once the connection is active.  Receives connection as first arg, and standard Node cb as second.
 *   Expected to call `during` when finished (at which point the connection is released).
 *
 * @optional {Function} onUnexpectedFailure
 *   Notifier function to run each time an unexpected failure notice is received one way or the other.
 *   Receives relevant Error as 1st argument.
 */
function doSomeStuffWithRedis(opts, done) {
  if (opts.connectionString === undefined) { return done(new Error('`connectionString` is required.')); }
  if (opts.during !== undefined & typeof opts.during !== 'function') {
    return done(new Error('If provided, `during` must be a function.'));
  }
  if (opts.onUnexpectedFailure !== undefined & typeof opts.onUnexpectedFailure !== 'function') {
    return done(new Error('If provided, `onUnexpectedFailure` must be a function.'));
  }
  
  Redis.createManager({
    connectionString: opts.connectionString,
    onUnexpectedFailure: function (err){
      // Use custom notifier function, if one was provided.
      if (opts.onUnexpectedFailure) {
        opts.onUnexpectedFailure(err);
        return;
      }
      //--• Otherwise, do the default thing (log a warning)
      console.warn('WARNING: Redis manager emitted a notice about an unexpected failure.  The redis server may have crashed, or become inaccessible.  Error details from Redis:', err);
    }
  }).exec(function (err, report){
    if (err) {
      return done(new Error('Could not create manager due to unexpected error: '+ err.stack));
    }//--• No reason to proceed any further.
    
    var mgr = report.manager;
    Redis.getConnection({
      manager: mgr
    }).exec(function (err, report){
      if (err) {
        return done(new Error('Could not get connection from manager, due to unexpected error: '+err.stack));
      }//--• No reason to proceed any further.
      
      // Local var for convenience.
      var connection = report.connection;
      
      
      console.log('CONNECTED!');
      
      // Now do stuff w/ the connection
      (opts.during||function noOp(connection, proceed){
        return proceed();
      })(report.connection, function afterwards (err_doingStuff) {
        if (err_doingStuff) {
          console.log('Unexpected error occurred while doing stuff with this Redis connection.  Details: '+err_doingStuff.stack);
          console.log('Nonetheless, continuing on to release the connection and destroy the manager....');
        }// >- continue on to attempt to release the connection and destroy the manager.
        
        // Always release the connection when finished:
        Redis.releaseConnection({
          connection: connection
        }).exec({
          error: function (err_releaseConnection){
            console.warn(new Error('Could not release Redis connection due to unexpected error: '+err_releaseConnection.stack));
            // ^^Note that we might want to also still attempt to destroy the manager here, even
            // though we couldn't release the connection. (However, we don't mess w/ that in this example code.)
            
            if (err_doingStuff) { return done(err_doingStuff); }
            else {
              console.warn('Triggering success callback anyway, since everything else seemed to work ok...');
              return done();
            }
          },
          success: function (report){
            console.log('Connection released.');
  
            // But ALWAYS destroy the connection manager when finished
            Redis.destroyManager({manager: mgr}).exec(function (err_destroyMgr){
              if (err_destroyMgr) {
                console.warn(new Error('Could not destroy Redis connection manager due to unexpected error: '+ err_destroyMgr.stack));
                
                if (err_doingStuff) { return done(err_doingStuff); }
                else {
                  console.warn('Triggering success callback anyway, since everything else seemed to work ok...');
                  return done();
                }
              }//--•
              
              console.log('Manager destroyed.');
              
              // Now, depending on whether we ran into an error above, finish up accordingly.
              if (err_doingStuff) {
                // Encountered an error along the way, but at least cleanup worked out ok!
                return done(err_doingStuff);
              }
              else {
                // Done.  No errors, and we cleaned up everything successfully!
                return done();
              }
              
            }); //</Redis.destroyManager>
  
          }//</on success :: Redis.releaseConnection()>
        });//</Redis.releaseConnection()>
      });//</during (do stuff while redis connection is active)>
    }); //</Redis.getConnection>
  }); //</Redis.createManager>
}//</declare :: doSomeStuffWithRedis()>


// Then e.g. you can do:
doSomeStuffWithRedis({
  // [redis:]//[[user][:password]@][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]] 
  connectionString: 'redis://127.0.0.1:6379/14', // 14 is the selected redis database
  onUnexpectedFailure: function (err){ console.warn('uh oh, looks like our redis might have just gone down:',err); },
  during: function (connection, proceed) {
    
    // Storing in key `stuff` value `things`
    Redis.cacheValue({
      connection: connection,
      key: 'stuff',
      value: 'things'
    }).exec(function (err, report){
      if (err) {
        return proceed(new Error('Could not cache value, due to unexpected error.  Error details: '+err.stack));
      }

      console.log('stored `stuff` key with `things`');

      // Get the cached value back
      Redis.getCachedValue({
        connection: connection,
        key: 'stuff'
      }).exec(function (err, report){
        if (err) {
          return proceed(new Error('Could not get cached value, due to unexpected error.  Error details:', err.stack));
        }

        console.log('stuff `key` contains `%s`', report.value);

        // remove keys. Notice that keys is an array of keys to remove
        Redis.destroyCachedValues({
          connection: connection,
          keys: ['stuff']
        }).exec(function (err, report){
          if (err) {
            return proceed(new Error('Could not get destroy cached values, due to unexpected error.  Error details:', err.stack));
          }

          console.log('key `stuff` removed');

          // Get the cached value back
          Redis.getCachedValue({
            connection: connection,
            key: 'stuff'
          }).exec({
            error: function (err){
              return proceed(new Error('Could not get cached value the 2nd time, due to unexpected error.  Error details:', err.stack));
            },
            notFound: function (){
              console.log('As we expected, the `stuff` key was not found this time.  Good!');
              return proceed();
            },
            success: function (){
              return proceed(new Error('Consistency violation: Should not have been able to find `stuff` key the 2nd time!!!  Must be a bug in our code.'));
            }
          }); //</Redis.getCachedValue>

        }); //</Redis.destroyCachedValues>
      }); //</Redis.getCachedValue>
    }); //</Redis.cacheValue>
  }//</during>
  
}, function afterwards(err) {
  if (err) {
    console.log('Attempted to do some stuff with redis, but encountered an error along the way:',err.stack);
    return;
  }//--•
  
  console.log('Successfully did some stuff with Redis!');
});

