const express = require('express'),
  http = require('http');
const socketio = require('socket.io');
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 9090 });
const { wssHandler } = require('./signalling-server/signal-ws');
const cors = require('cors');

const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./util/users');

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

//EJS
app.use(cors());

//Bodyparser
app.use(express.urlencoded({ extended: true }));

//Express Session
app.use(
  session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
  })
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use(express.json());

wss.on('connection', wssHandler);

io.on('connect', socket => {
  console.log('New connection established');
  socket.on('join', (_id, roomId, callback) => {

    const { error, user } = addUser({ socketId: socket.id, _id: _id, roomId: roomId });
    if (error) return callback(error);

    socket.join(user.roomId);

    io.to(user.roomId).emit('roomData', {
      roomId: roomId,
      users: getUsersInRoom(roomId)
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    console.log(message)
    const user = getUser(socket.id);
    io.to(user.room).emit('message', { _id: user._id, message: message });
    callback();
  });

  socket.on('disconnect', () => {
    console.log('disconnecting')
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.roomId).emit('message', {
        name: 'admin',
        message: `${user.name} has left!`
      });
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
  .use('/', require('./routes/index'));

server.listen(PORT, console.log(`Server started on port ${PORT}`));
