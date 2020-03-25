const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("../util/users");

let loggedInUsers = new Set();
let state = undefined;

function socketHandler(io, socket) {
  socket.on("listen-to-me", () => console.log("hello"));
  socket.on("login-user", _id => {
    loggedInUsers.add(_id);
    console.log("loggin in", loggedInUsers);
    io.emit("updateUsers", [...loggedInUsers]);
  });
  socket.on("logout-user", _id => {
    loggedInUsers.delete(_id);
    console.log("loggin out", loggedInUsers);
    io.emit("updateUsers", [...loggedInUsers]);
  });

  console.log("New connection established");
  socket.on("join", (name, roomid, _id, callback) => {
    if (roomid) {
      let user = getUser(socket.id);
      if (user) {
        removeUser(socket.id);
      }
      ({ user } = addUser(socket.id, roomid, name, _id));
      socket.join(user.roomId);

      io.to(user.roomId).emit("roomData", {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
    callback();
  });

  socket.on("message", (message, callback) => {
    let user = getUser(socket.id);
    io.to(user.roomId).emit("message", { _id: user._id, message: message });
    callback();
  });

  socket.on("changeConnection", () => {
    console.log("disconnecting");
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.roomId).emit("roomData", {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
  });
  socket.on("disconnect", () => {
    console.log("loggedInUsers", loggedInUsers);
    socket.broadcast.emit("updateUsers", [...loggedInUsers]);
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.roomId).emit("roomData", {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
  });
}

module.exports = socketHandler;
