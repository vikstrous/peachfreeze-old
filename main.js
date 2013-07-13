var TESTING = false;

var tracker = new TrackerConnection('10.16.23.10', 1337);
var global_users = [];

var MY_ID = 1;
var HIS_ID = 2;

document.querySelector('#choose_file').addEventListener('click', function(e) {
  uploadProfileImage();
});

function uploadProfileImage(cb){
  chrome.fileSystem.chooseEntry({type: 'openFile', accepts: [{
    //mimeTypes: ['text/*'],
    extensions: ['jpg', 'png', 'gif']
  }]},function(readOnlyEntry) {
    if (!readOnlyEntry) {
      // user cancelled
      return;
    }
    readOnlyEntry.file(function(file) {
      var reader = new FileReader();

      reader.onerror = function(){
        console.error(arguments);
      };
      reader.onload = function(e) {
        console.log(e.target.result);
        cb(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  });
}


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

function setupUser(id, port, callback) {
  // TODO use first argument as error model
  Step(
    function genKey() {
      getOrGenKey('dsaKey' + id, this);
    },
    function saveFingerPrint(key) {
      model = new OTRUser({id: id});
      model.setKey(key);
      this(model);
    },
    function fetchUser(model) {
      model.fetch({ success: this, error: this });
    },
    function createUserIfNecessary(model, request, options) {
      if (options.error_msg) {
        console.log('Creating new user');
        model.set('host', '0.0.0.0');
        model.set('port', port);
        model.save(null, { success: this, error: this });
      } else {
        console.log('Retrieved user from local storage');
        console.log(model);
        this(model);
      }
    },
    function startTheServer(model) {
      model.setTracker(tracker); // Important
      model.startServer();
      callback(model);
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

      /*
      user1.on('new_friend', function(friend) {
        console.log(friend, 'new friend');
        friend.socket.on('msg', function(){console.log(arguments);});
      });
      user1.on('connection', function(friend) {
        console.log(friend, 'connection');
        friend.socket.on('msg', function(){console.log(arguments);});
      });
      */

      if (user2) {
        user2.findAndAddFriend(user1.myKey.fingerprint(), function() {
          user2.sendPrivateMessage(user2.friends.get(user1.myKey.fingerprint()), new Message({ message: 'hello' }));
        });
      }

      setupUI(user1);
    });
  });
}

function setupUI(user) {
  var pv = new ProfileView({ model:user });
  pv.render();

  /*
  var mc = new Messages();
  mc.reset([{sender:'title', message: 'text'}, {sender:'ti2tle', message: 'tex2t'}]);
  */

  var uv = new UsersView({collection: user.friends, user: user});
  uv.render();

  var mc = user.messages;

  var mv = new MessagesView({ collection: mc, user: user });
  mv.render();
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

