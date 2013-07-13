var tracker = new TrackerConnection('127.0.0.1', 1337);

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
          friend.socket.on('msg', function(){console.log(arguments);});
        });
        user1.on('connection', function(friend){
          console.log(friend, 'connection');
          friend.socket.on('msg', function(){console.log(arguments);});
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
          user2.get('friends')[user2.friends_by_fp[keyA.fingerprint()]].user.connect(function(){
            user2.get('friends')[user2.friends_by_fp[keyA.fingerprint()]].user.send('msg', 'hello');
          });
        });
      });
    });
  });
});
