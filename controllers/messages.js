const Message = require('../models/Message');
const User = require('../models/User');
const uniqueString = require('unique-string');

module.exports = {
  getAll: (req, res) => {
    Message.find({}, (err, messages) => {
      res.send(messages);
    });
  },
  postMessage: async (req, res) => {
    const { data, recId } = req.body;

    let user1 = req.user;
    let user2 = await User.findOne({ name: 'Pawel' });
    let uniqStr;

    const message = new Message({ ...data, from: user1._id, to: user2._id });

    const thread = [...user1.messages.keys()];

    if (!thread.includes(user2._id.toString())) {
      uniqStr = uniqueString();
      user1.messages.set(user2._id.toString(), {
        roomId: uniqStr,
        messageHistory: []
      });
      user2.messages.set(user1._id.toString(), {
        roomId: uniqStr,
        messageHistory: []
      });
    }
    let mapContent = user1.messages.get(user2._id.toString());
    let messageHistory = user1.messages.get(user2._id.toString()).messageHistory;
    mapContent.messageHistory = [...messageHistory, message];

    user1.messages.set(user2._id.toString(), mapContent);
    user2.messages.set(user1._id.toString(), mapContent);

    try {
      user1.save();
      user2.save();
      message.save();
    } catch {
      res.status(500).end('Server error!');
    } finally {
      res.status(201).send(data);
    }
  }
};
