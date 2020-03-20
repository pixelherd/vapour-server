const Message = require('../models/Message');
const User = require('../models/User');

module.exports = {
  getAll: (req, res) => {
    Message.find({}, (err, messages) => {
      res.send(messages);
    });
  },
  postMessage: async (req, res) => {
    const { message, recipientId, senderId, senderName } = req.body;

    let sender = await User.findById(senderId);
    let recipient = await User.findById(recipientId);

    const newMessage = new Message({
      ...message,
      from: sender._id,
      to: recipient._id,
      senderName: senderName
    });


    let mapContent = sender.messages.get(recipient._id.toString());

    let messageHistory = sender.messages.get(recipient._id.toString())
      .messageHistory;
    mapContent.messageHistory = [...messageHistory, newMessage];

    sender.messages.set(recipient._id.toString(), mapContent);
    recipient.messages.set(sender._id.toString(), mapContent);
    
    try {
      sender.save();
      recipient.save();
      newMessage.save();
    } catch {
      res.status(500).end('Server error!');
    } finally {
      res.status(201).send(newMessage);
    }
  }
};
