//TODO: multiple types of events
;(function(exports){
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

  TrackerConnection.prototype.connect = function(){
    this.socket.connect.apply(this.socket, arguments);
  };

  TrackerConnection.prototype.announce = function(ip, port, fp, cb){
    //TODO: implement fingerprint verification; also tracker authentication
    this.socket.send('announce', {fp: fp, ip:ip, port:port}, cb);
  };

  TrackerConnection.prototype.findUser = function(fp, cb){
    this.socket.send('read', fp, cb);
  };

  var OTRFriend = Backbone.Model.extend({
    default: {
      socket: null,
      host: '',
      port: '',
      key: '',
      fp: ''
    },

    connect: function(cb) {
      this.get('socket').connect(function(ost_socket) {
        this.set('key', ost_socket.pipeline[3].buddy.their_priv_pk);
        cb();
      }.bind(this));
    },

    send: function(topic, msg, cb) {
      this.get('socket').send(topic, msg, cb);
    }
  });

  var OTRFriends = Backbone.Collection.extend({
    model: OTRFriend
  });

  var OTRUser = Backbone.Model.extend({
    defaults: {
      host: '',
      port: '',
      myKey: '',
      tracker: '',
      friends: [],
      connected: false // Can listen on changes to this
    },

    initialize: function() {
      if (!this.has('myKey') || this.get('myKey') === '') this.set('myKey', new DSA());
      else if (typeof this.get('myKey') === 'string') this.set('myKey', DSA.parsePrivate(this.get('myKey')));

      var myKey = this.get('myKey');

      var pipeline = function(){return [new EventToObject(), new ObjectToString(), new OTRPipe(myKey), new BufferDefragmenterStage1(), new StringToBuffer(), new BufferDefragmenter2()];};
      this.server = new SocketServer(this.get('host'), this.get('port'), pipeline);
      this.server.on('connection', this._onconnection.bind(this));
      this.friends_by_fp = {};
    },

    //util.inherits(OTRUser, EventEmitter);

    _onconnection: function(otr_socket) {
      // received connection, choose what to do with it - new friend or existing friend?
      // We have to wait for OTR to finish its thing
      //TODO: find a less hacky way to access the buddy object
      var buddy = otr_socket.pipeline[3].buddy;

      var theRest = function(){
        var fp = buddy.their_priv_pk.fingerprint();
        if(!this.get('friends')[this.friends_by_fp[fp]]){
          var id = this.get('friends').length;
          this.get('friends').push(new OTRFriend({
            host: otr_socket.host,
            port: otr_socket.port,
            key: buddy.their_priv_pk,
            fp: fp,
            socket: otr_socket
          }));
          this.friends_by_fp[fp] = id;
          console.log('new friend', this.get('friends')[id]);
          this.trigger('new_friend', this.get('friends')[id]);
        } else {
          console.log('old friend', this.get('friends')[this.friends_by_fp[fp]]);
          this.get('friends')[this.friends_by_fp[fp]].socket = otr_socket;
          this.trigger('connection', this.get('friends')[this.friends_by_fp[fp]]);
        }
        this.set('connected', true);
      }.bind(this);

      if(buddy.msgstate !== OTR.CONST.MSGSTATE_ENCRYPTED){
        var cb = function (state) {
          if(state === OTR.CONST.STATUS_AKE_SUCCESS){
            theRest();
            buddy.off('status', cb);
          }
        };
        buddy.on('status', cb);
      } else {
        theRest();
      }
    },

    listen: function(cb) {
      this.server.listen(function(res){
        console.log('announcing');
        this.get('tracker').announce(this.server.ip, this.server.port, this.get('myKey').fingerprint(), function(res){
          if(typeof cb == 'function') cb();
        });
      }.bind(this));
    },

    findAndAddFriend: function(fp, cb) {
      this.get('tracker').findUser(fp, function(res){
        this.addFriend(res.ip, res.port, res.fp, cb);
      }.bind(this));
    },

    addFriend: function(host, port, fp, cb) {
      var id = this.get('friends').length;
      var myKey = this.get('myKey');
      var pipeline = function(){return [new EventToObject(), new ObjectToString(), new OTRPipe(myKey), new BufferDefragmenterStage1(), new StringToBuffer(), new BufferDefragmenter2()];};
      this.get('friends').push(new OTRFriend({
        socket: new Socket(host, port, pipeline),
        host: host,
        port: port,
        fp: fp
      }));
      this.friends_by_fp[fp] = id;
      if(typeof cb == 'function') cb(fp);
    }
  });

  exports.TrackerConnection = TrackerConnection;
  exports.OTRUser = OTRUser;
  exports.OTRFriend = OTRFriend;
  exports.OTRFriends = OTRFriends;
})(window);
