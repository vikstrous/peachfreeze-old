var TESTING = true;

var tracker = new TrackerConnection('127.0.0.1', 1337);
var global_users = [];

var MY_ID = 1;
var HIS_ID = 2;

function getOrGenKey(name, cb){
  chrome.storage.local.get(name, function(data) {
    var myKey;
    var got_key = data[name];
    if (got_key) {
      myKey = DSA.parsePrivate(got_key);
    } else {
      console.log('Generating DSA');
      myKey = new DSA();
      var data2 = {};
      data2[name] = myKey.packPrivate();
      chrome.storage.local.set(data2, function() {});
    }
    cb(myKey);
  });
}

/*
function AsyncJoiner() {
  this.branches = 0;
  this.ready = false;
  this.done_count = 0;
  this.callback = null;
  this.lock = false;
}

AsyncJoiner.prototype.setCallback(f) {
  this.callback = f;
}

AsyncJoiner.prototype._branch_done = function() {
  this.done_count++;
  if (this.ready && this.done_count >= this.branches) {
    this.callback();
  }
}

AsyncJoiner.prototype.add = function(f) {
  this.branches++;
  var self = this;
  var called = false;
  return (function() {
    f(arguments.slice(1));
    if (!called) {
      called = true;
      self._branch_done();
    }
  });
};

AsyncJoiner.prototype.ready = function() {
  if (this.done_count >= this.branches) {
    this.callback();
  }
  this.ready = true;
};

*/

function setupUser(id, port, callback) {
  var user_model = new OTRUser({id: id});
  Step(
    function fetchUser() {
      user_model.fetch(
        {
          success: this,
          error: this
        }
      );
    },
    function createUserIfNecessary(model, request, options) {
      if (options.error_msg) {
        console.log('Creating new user');
        model = new OTRUser({
          id: id,
          host: '127.0.0.1',
          port: port,
        });
        model.save(null, { success: this, error: this });
      } else {
        console.log('Retrieved user from local storage');
        console.log(model);
        this(model); // This is correct.
      }
    },
    function genKey(model, request, options) {
      user_model = model;
      user_model.setTracker(tracker); // Important
      getOrGenKey('dsaKey' + id, this);
    },
    function startTheServer(key) {
      user_model.startServer(key);
      callback(user_model);
    }
  );
}

function setupTracker(user1, user2) {
  global_users = [user1, user2]
  tracker.connect(function(){
    user1.listen(function(err){
      if (err) {
        throw err;
      }
      // at this point announcing is done

      tracker.findUser(user1.myKey.fingerprint(), function(){
        console.log('found user:', arguments);
      });

      user1.on('new_friend', function(friend){
        console.log(friend, 'new friend');
        friend.get('socket').on('msg', function(){console.log(arguments);});
      });
      user1.on('connection', function(friend){
        console.log(friend, 'connection');
        friend.get('socket').on('msg', function(){console.log(arguments);});
      });

      if (user2) {
        user2.findAndAddFriend(user1.myKey.fingerprint(), function() {
          user2.friends.get(user1.myKey.fingerprint()).get('socket').connect(function() {
            user2.friends.get(user1.myKey.fingerprint()).get('socket').send('msg', 'hello');
          });
        });
      }
    });
  });
}

function setup() {
  var user1 = null;
  Step(
    function() {
      setupUser(MY_ID, 34562, this);
    },
    function(user_model) {
      user1 = user_model;
      if (TESTING) {
        setupUser(HIS_ID, 34563, this);
      } else  {
        return null;
      }
    },
    function(user_model) {
      setupTracker(user1, user_model);
    }
  );
}
setup();

