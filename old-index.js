const express = require('express'),
  http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PORT = 3000;


app
  .use(express.static(__dirname))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }));

app.get('/messages', async (req, res) => {
  // const payload = await Message.find({}, (err, messages) => {
  // }).populate('to');

  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});



io.engine.generateId = (req) => {
  return '5e6be9b10c023e2256e75865'; // custom id must be unique
}


app.post('/messages', async (req, res) => {

  let user1 = await User.findOne({ name: 'Joe' });
  let user2 = await User.findOne({ name: 'Bruce' });

  if (!user1&&!user2) {
    user1 = new User({name: 'Alex', messages: {}});
    user2 = new User({name: 'Bruce', messages: {}});
    await user1.save();
    await user2.save();
  }

  const message = new Message({
    message: req.body.message,
    to: user2._id,
    from: user1._id,
    time: req.body.time
  });

  const promise1 = new Promise((res, rej) => {
    //when no convertsation is started with a new user, we must create a new map and pass it an empty array
    if (!user1.messages.get([user2._id].toString())) {
      user1.messages.set([user2._id].toString(), []);
    }

    if (user1.messages.get([user2._id].toString()).length === 0 ) {
      user1.messages.set([user2._id].toString(), [message])
    } else {
      user1.messages.set([user2._id].toString(), [...user1.messages.get([user2._id].toString()), message])
    }
    res(user1.save());
  });

  const promise2 = new Promise((res, rej) => {
    if (!user2.messages.get([user1._id].toString())) {
      user2.messages.set([user1._id].toString(), []);
    }
    if (user2.messages.get([user1._id].toString()).length === 0 ) {
      user2.messages.set([user1._id].toString(), [message])
    } else {
      user2.messages.set([user1._id].toString(), [...user2.messages.get([user1._id].toString()), message])
    }
    res(user2.save());
  });

  const promise3 = new Promise((res, rej) => {
    res(message.save());
  });

  Promise.all([promise1, promise2, promise3]).then(data => {
    if (!data) {
      res.status(500).end('No name!');
    } else {
      io.to(user2._id.toString()).emit('private message', req.body);
      res.sendStatus(200);
    }
  });
});


io.on('connection', (socket) => {
  console.log('a user is connected', socket.id);
});

server.listen(PORT, () => {
  console.log('server is running on port');
});
