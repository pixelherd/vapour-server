const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('../util/users');

let loggedInUsers = new Set();

function socketHandler(io, socket) {
  socket.on('login', async (_id, callback) => {
    loggedInUsers.add(_id);
    socket.broadcast.emit('updateUsers', [...loggedInUsers]);
    callback([...loggedInUsers]);
  });
  socket.on('logout', async _id => {
    loggedInUsers.delete(_id);
    socket.broadcast.emit('updateUsers', [...loggedInUsers]);
  });

  console.log('New connection established');
  socket.on('join', (name, roomid, _id, callback) => {
    if (roomid) {
      let user = getUser(socket.id);
      if (user) {
        removeUser(socket.id);
      }
      ({ user } = addUser(socket.id, roomid, name, _id));
      socket.join(user.roomId);

      io.to(user.roomId).emit('roomData', {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
    callback();
  });

  socket.on('message', (message, callback) => {
    let user = getUser(socket.id);
    io.to(user.roomId).emit('message', { _id: user._id, message: message });
    callback();
  });

  socket.on('changeConnection', () => {
    console.log('disconnecting');
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
      io.to(user.roomId).emit('roomData', {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
  });
}

module.exports = socketHandler;
