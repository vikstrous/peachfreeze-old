var tracker = new TrackerConnection('127.0.0.1', 1337);

document.querySelector('#choose_file').addEventListener('click', function(e) {
  uploadProfileImage();
});

function uploadProfileImage(){
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
        console.log(arguments);
      };
      reader.onload = function(e) {
        console.log(e.target.result, 'new profile image');
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
      myKey = new DSA();
      var data2 = {};
      data2[name] = myKey.packPrivate();
      chrome.storage.local.set(data2, function() {});
    }
    cb(myKey);
  });
}

tracker.connect(function(){
  getOrGenKey('dsaKeyUserA', function(keyA){
    getOrGenKey('dsaKeyUserB', function(keyB){
      var user1 = new OTRUser({
          host: '127.0.0.1',
          port: 34562,
          myKey: keyA,
          tracker: tracker
      });

      user1.listen(function(err){
        if (err) {
          throw err;
        }
        // at this point announcing is done

        tracker.findUser(keyA.fingerprint(), function(){
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

        var user2 = new OTRUser( {
            host: '127.0.0.1',
            port: 34563,
            myKey: keyB,
            tracker: tracker
        });
        user2.findAndAddFriend(keyA.fingerprint(), function(){
          console.log(user1);
          console.log(user2);
          user2.get('friends').get(keyA.fingerprint()).get('socket').connect(function(){
            user2.get('friends').get(keyA.fingerprint()).get('socket').send('msg', 'hello');
          });
        });
      });
    });
  });
});
