const express = require('express'),
  http = require('http');
const socketio = require('socket.io');
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 9090 });
const { wssHandler } = require('./signalling-server/signal-ws');
const cors = require('cors');

const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session)

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./util/users');

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  pingTimeout: 30000
});

// Passport config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

//Connect to Mongo
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(e => console.log(e));

//CORS
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

//Bodyparser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Express Session
app.use(session({
  secret: 'mysecret',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false,
  // cookie: {maxAge: 60000}
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

wss.on('connection', wssHandler);

let loggedInUsers = [];

io.on('connection', socket => {

  socket.on('login', (_id, callback) => {
    if (!loggedInUsers.includes(_id)) {
      loggedInUsers.push(_id)
    }
    callback();
    console.log(loggedInUsers)
  })
  socket.on('logout', (_id, callback) => {
    console.log(loggedInUsers, 'logging out')
    loggedInUsers = loggedInUsers.filter(userId => userId !== _id);
    console.log(loggedInUsers)
    callback();
  })

  console.log('New connection established');
  socket.on('join', (name, roomid, _id, callback) => {
    console.log('joining', roomid);
    if (roomid) {
      const { error, user } = addUser(socket.id, roomid, name, _id);
      if (error) return callback(error);
      socket.join(user.roomId);

      io.to(user.roomId).emit('roomData', {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
  });

  socket.on('message', (message, callback) => {
    let user = getUser(socket.id);
    console.log(user);
    io.to(user.roomId).emit('message', { _id: user._id, message: message });
    callback();
  });

  socket.on('disconnect', () => {
    console.log('disconnecting');
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.roomId).emit('roomData', {
        room: user.roomId,
        users: getUsersInRoom(user.roomId)
      });
    }
  });
});


//Routes
app
  .use('/messages', require('./routes/messages'))
  .use('/users', require('./routes/users'))

server.listen(PORT, console.log(`Server started on port ${PORT}`));
