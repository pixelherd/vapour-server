const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = Schema({
  message: String,
  time: String,
  from: { type: Schema.Types.ObjectId, ref: 'User' },
  to: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
