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
        ({ user } = addUser(socket.id, roomid, name, _id));
      } else {
        ({ user } = addUser(socket.id, roomid, name, _id));
      }
      const room = user.roomId;
      socket.join(room);
      io.to(room).emit('roomData', {
        room: room,
        users: getUsersInRoom(room)
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
