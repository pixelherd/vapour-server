const users = [];

const addUser = ({ socketId, _id, roomId }) => {
  const existingUser = users.find(user => {
    user._id === _id && user.roomId === roomId;
  });
  if (existingUser) {
    return { error: 'user already logged in' };
  }

  const user = { socketId, _id, roomId };
  users.push(user);

  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.socketId === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.socketId === id);
};

const getUsersInRoom = roomId => {
  return users.filter(user => {
    user.roomId === roomId;
  });
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
