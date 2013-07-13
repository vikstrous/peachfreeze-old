var config = {
  ip: '127.0.0.1',
  port: 1333
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
    console.log('announced', data);
    state.users[data.fp] = {ip:data.ip, port:data.port};
    if(typeof cb === 'function') cb();
  });
  socket.on('read', function(data, cb){
    console.log('reading', data);
    if(state.users[data]){
      cb({fp: data, ip: state.users[data].ip, port: state.users[data].port});
    } else {
      cb(null);
    }
  });
});
