const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('../util/users');

let loggedInUsers = new Set();

function socketHandler(io, socket) {
  io.emit('updateUsers', [...loggedInUsers]);
  socket.on('login-user', _id => {
    loggedInUsers.add(_id);
    io.emit('updateUsers', [...loggedInUsers]);
  });
  socket.on('logout-user', _id => {
    loggedInUsers.delete(_id);
    io.emit('updateUsers', [...loggedInUsers]);
  });

  socket.on('join', (name, roomid, _id, callback) => {
    if (roomid) {
      let user = getUser(socket.id);
      if (user) {
        removeUser(socket.id);
        // socket.to(user.roomId).emit('message', { message: {senderName: 'Admin', message: `${user.name} has left!`, time: Date.now()} });
      }
      ({ user } = addUser(socket.id, roomid, name, _id));
      socket.join(user.roomId);
      socket.to(user.roomId).emit('message', { message: {senderName: 'Admin', message: `${user.name} has joined!`, time: Date.now()} });
      io.to(user.roomId).emit('roomData', {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
    callback();
  });

  socket.on('message', (message, callback) => {
    let user = getUser(socket.id);
    io.to(user.roomId).emit('message', { message: message });
    callback();
  });

  socket.on('changeConnection', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.roomId).emit('roomData', {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
  });
  socket.on('disconnect', () => {
    io.emit('updateUsers', [...loggedInUsers]);
    const user = removeUser(socket.id);
    if (user) {
      loggedInUsers.delete(user._id);
      io.to(user.roomId).emit('roomData', {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
  });
}

module.exports = socketHandler;
