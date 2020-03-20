const users = [];

const addUser = (socketId, roomId, name ) => {

  // console.log(socketId, roomId, name);

  const recipient = users.find(user => 
    user.roomId === roomId
  );
  let user = { socketId, roomId, name };
  
  if (recipient && recipient.socketId === user.socketId) {
    return error;
  }

  users.push(user);

  return { user };
};

const removeUser = id => {
  console.log(id);
  const index = users.findIndex(user => user.socketId === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  console.log(users);
  return users.find(user => user.socketId === id);
};

const getUsersInRoom = roomId => {
  return users.filter(user => {
    user.roomId === roomId;
  });
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
