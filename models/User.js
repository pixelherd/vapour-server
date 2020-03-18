const mongoose = require('mongoose');

<<<<<<< HEAD
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
=======
const UserSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true
  },
  email: {
    type: String, 
    required: true
  },
  password: {
    type: String, 
>>>>>>> origin/dev
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
<<<<<<< HEAD
  },
  messages: {
    type: Map,
    of: {
      _id : false,
      roomId: String,
      messageHistory: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
    }
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
=======
  }
});

const User = mongoose.model('User', UserSchema)

module.exports = User;
>>>>>>> origin/dev
