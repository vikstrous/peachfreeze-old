var config = {
  ip: '0.0.0.0',
  port: 1337
};

var state = {
  socketId: null,
  connections: {}, // by socketId
  users: {} // by signature
};

var server = new SocketServer(config.ip, config.port);
console.log(config.ip, config.port);
server.listen(function(err){
  if(err) throw err;
});
server.on('connection', function(socket) {
  socket.on('announce', function(data, cb){
	 data.fp = data.fp.toLowerCase();
	 console.log("WHAT?" + data.fp);
	 data.fp.replace(/\s+/g, '');
    console.log('announced', data);
    state.users[data.fp] = {ip:data.ip, port:data.port};
    if(typeof cb === 'function') cb();
  });
  socket.on('read', function(data, cb){
	data = data.toLowerCase();
	data.replace(/\s+/g, '');
	console.log("WHOA" + data);
    console.log('reading', data);
    if(state.users[data]){
      cb({fp: data, ip: state.users[data].ip, port: state.users[data].port});
    } else {
      cb(null);
    }
  });
});
