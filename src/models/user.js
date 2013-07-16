//TODO: multiple types of events
;
(function(exports) {
  var util = {
    inherits: function(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    },
    _errorMap: {},
    errorName: function(code) {
      return util._errorMap[code] ? util._errorMap[code] : code;
    }
  };

  function debug() {
    // console.log(arguments);
  }

  function TrackerConnection(ip, port) {
    //TODO: use OTR socket
    console.log(ip, port);
    this.socket = new Socket(ip, port);

  }

  util.inherits(TrackerConnection, EventEmitter);

  TrackerConnection.prototype.connect = function() {
    this.socket.connect.apply(this.socket, arguments);
  };

  TrackerConnection.prototype.announce = function(ip, port, fp, cb) {
    //TODO: implement fingerprint verification; also tracker authentication
    this.socket.send('announce', {
      fp: fp,
      ip: ip,
      port: port
    }, cb);
  };

  TrackerConnection.prototype.findUser = function(fp, cb) {
    this.socket.send('read', fp, cb);
  };

  function Profile(name, image, about, details, stats) {
    this.name = name;
    this.image = image;
    this.about = about;
    this.details = details;
    this.stats = stats;
  }

  var OTRFriend = Backbone.Model.extend({
    'class_name': 'OTRFriend',
    'idAttribute': 'fp',

    'default': function() {
      return {
        host: '',
        port: '',
        fp: '',
        accepted: false,
        connected: false,
        profile: new Profile()
      };
    },

    'connect': function(cb) {
      console.log('connecting to friend');

      this.socket.connect(function(err) {
        if (err) {
          this.set('connected', false);
        } else {

          var buddy = this.socket.pipeline[3].buddy;

          var theRest = function() {
            var fp = buddy.their_priv_pk.fingerprint();
            this.myKey = buddy.their_priv_pk;
            this.set('connected', true);
            console.log('connected to friend');
          }.bind(this);

          if (buddy.msgstate !== OTR.CONST.MSGSTATE_ENCRYPTED) {
            var otr_cb = function(state) {
              if (state === OTR.CONST.STATUS_AKE_SUCCESS) {
                theRest();
                buddy.off('status', otr_cb);
              }
            };
            buddy.on('status', otr_cb);
          } else {
            theRest();
          }
          buddy.sendQueryMsg();
        }
      }.bind(this));
    },

    'send': function(topic, msg, cb) {
      this.socket.send(topic, msg, cb);
    }
  });

  var OTRFriends = Backbone.Collection.extend({
    model: OTRFriend
  });

  var OTRUser = Backbone.Model.extend({
    class_name: 'OTRUser',
    defaults: {
      host: '',
      port: '',
      profile: new Profile(),
      connected: false // Can listen on changes to this
    },

    initialize: function() {
      this.friends = new OTRFriends();
      var friendsOptions = this.getPersistOptions();
      friendsOptions.success = function(collection, friends, options) {
        collection.map(function(friend) {
          friend.set('connected', false);
          this.tracker.findUser(friend.get('fp'), function(res) {
            if (!res) {
              console.error('friend offline', friend);
            } else {
              console.log(res, 'res');
              var key = this.myKey;
              var pipeline = function() {
                return [new EventToObject(), new ObjectToString(), new OTRPipe(key), new BufferDefragmenterStage1(), new StringToBuffer(), new BufferDefragmenter2()];
              };
              friend.socket = new Socket(res.ip, res.port, pipeline);
              friend.connect(function() {
                console.error('friend online', friend);
                friend.set('connected', true);
                console.log('friend connected!!! listening and sending profile');
                this.listenOnFriend(friend);
                this.sendProfileToFriend(friend);
              }.bind(this));
            }
          }.bind(this));
        }.bind(this));
      }.bind(this);
      this.friends.fetch(friendsOptions);
      this.messages = new Messages();
      this.messages.fetch(this.getPersistOptions());
      this.listenTo(this, 'change:profile', function() {
        this.friends.map(function(friend) {
          this.sendProfileToFriend(friend);
        }.bind(this));
      }.bind(this));
      // TODO: hook up sockets with all friends
    },

    getPersistOptions: function() {
      return {
        key_suffix: ('_' + this.get('id'))
      };
    },

    setTracker: function(t) {
      this.tracker = t;
    },

    setKey: function(key) {
      if (!key) {
        this.myKey = new DSA();
      } else if (typeof key === 'string') {
        console.error('PARSING KEY FROM STRING ' + key);
        this.myKey = DSA.parsePrivate(key);
      } else {
        this.myKey = key;
      }
      this.set('fp', this.myKey.fingerprint());
    },

    startServer: function() {
      var key = this.myKey;
      var pipeline = function() {
        return [new EventToObject(), new ObjectToString(), new OTRPipe(key), new BufferDefragmenterStage1(), new StringToBuffer(), new BufferDefragmenter2()];
      };
      console.log(this);
      console.log('Starting server on ' + this.get('host') + ':' + this.get('port'));
      this.server = new SocketServer(this.get('host'), this.get('port'), pipeline);
      this.server.on('connection', this._onconnection.bind(this));
    },

    _onconnection: function(otr_socket) {
      // received connection, choose what to do with it - new friend or existing friend?
      // We have to wait for OTR to finish its thing
      //TODO: find a less hacky way to access the buddy object
      var buddy = otr_socket.pipeline[3].buddy;

      var theRest = function() {
        var fp = buddy.their_priv_pk.fingerprint();
        var friend;
        console.log('FINDING FRIEND');
        console.log(fp);
        console.log(this.friends);
        console.log(this.friends.get(fp));
        if (!this.friends.get(fp)) {
          console.log('new friend');
          // new friend
          this.tracker.findUser(fp, function(res) {
            friend = new OTRFriend({
              host: res.ip,
              port: res.port,
              fp: fp,
              connected: true
            });
            friend.myKey = buddy.their_priv_pk;
            friend.socket = otr_socket;
            this.friends.add(friend);
            friend.save(null, this.getPersistOptions());
            this.listenOnFriend(friend);
            this.sendProfileToFriend(friend); // TODO - don't send this until you confirm

            console.error('friend online 4', friend);
            friend.set('connected', true);
            this.trigger('connection', friend);
          }.bind(this));
        } else {
          // old friend (loaded form storage)
          console.log('old friend');
          friend = this.friends.get(fp);
          friend.socket = otr_socket;
          this.listenOnFriend(friend);
          this.sendProfileToFriend(friend);
          console.error('friend online 2', friend);
          friend.set('connected', true);
          this.trigger('connection', friend);
        }
      }.bind(this);

      if (buddy.msgstate !== OTR.CONST.MSGSTATE_ENCRYPTED) {
        var cb = function(state) {
          if (state === OTR.CONST.STATUS_AKE_SUCCESS) {
            theRest();
            buddy.off('status', cb);
          }
        };
        buddy.on('status', cb);
      } else {
        theRest();
      }
      buddy.sendQueryMsg();
    },

    listen: function(cb) {
      this.server.listen(function(res) {
        console.log('announcing');
        chrome.socket.getNetworkList(function(interfaces) {
          this.tracker.announce(interfaces[1].address, this.server.port, this.myKey.fingerprint(), function(res) {
            if (typeof cb == 'function') cb();
          });
        }.bind(this));
      }.bind(this));
    },

    findAndAddFriend: function(fp, cb) {
      this.tracker.findUser(fp, function(res) {
        this.addFriend(res.ip, res.port, res.fp, cb);
      }.bind(this));
    },

    addFriend: function(host, port, fp, cb) {
      if (!this.friends.get(fp)) {
        var key = this.myKey;
        var pipeline = function() {
          return [new EventToObject(), new ObjectToString(), new OTRPipe(key), new BufferDefragmenterStage1(), new StringToBuffer(), new BufferDefragmenter2()];
        };
        var friend = new OTRFriend({
          host: host,
          port: port,
          fp: fp,
          accepted: true,
          connected: false
        });
        friend.set('connected', false);
        friend.socket = new Socket(host, port, pipeline);
        // Add key?
        this.friends.add(friend);
        friend.save(null, this.getPersistOptions());
        this.listenOnFriend(friend);
        friend.socket.connect(function(err) {
          if (err) {
            console.log('friend offline 3');
            throw err;
          }
          console.error('friend online 3', friend);
          friend.set('connected', true);

          var buddy = friend.socket.pipeline[3].buddy;

          var theRest = function() {
            this.sendProfileToFriend(friend);
            this.trigger('new_friend', friend);
            if (typeof cb == 'function') cb(fp);
          }.bind(this);

          if (buddy.msgstate !== OTR.CONST.MSGSTATE_ENCRYPTED) {
            var cb2 = function(state) {
              if (state === OTR.CONST.STATUS_AKE_SUCCESS) {
                theRest();
                buddy.off('status', cb2);
              }
            };
            buddy.on('status', cb2);
          } else {
            theRest();
          }
          buddy.sendQueryMsg();

        }.bind(this));
      } else {
        console.log("adding an existing friend");
      }
    },

    listenOnFriend: function(friend) {
      var socket = friend.socket;
      var self = this;
      socket.on('profile', function(profile) {
        friend.set('profile', profile);
        friend.save(null, this.getPersistOptions());
      }.bind(this));
      socket.on('msg', function(msg) {
        var message = new Message(msg);
        console.log(message, 'YO');
        self.messages.add(message);
        message.save(null, self.getPersistOptions());
      });
    },

    // TODO: add callbacks to try sending again
    sendProfileToFriend: function(friend) {
      if (friend.socket) //TODO: find a better way to check if user is connected
        friend.socket.send('profile', this.get('profile'));
    },

    sendPrivateMessage: function(friend, msg) {
      friend.socket.send('msg', msg.toJSON());
    },

    broadcastMessage: function(msg) {
      msg.sender = this.get('profile').name;
      this.friends.map(function(friend) {
        this.sendPrivateMessage(friend, msg);
      }.bind(this));

      // This will add it to the view
      this.messages.add(msg);
      // And this will persist it forever!
      msg.save(null, this.getPersistOptions());
    }

  });

  exports.TrackerConnection = TrackerConnection;
  exports.OTRUser = OTRUser;
  exports.OTRFriend = OTRFriend;
  exports.OTRFriends = OTRFriends;
})(window);