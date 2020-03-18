require('dotenv').config();
const { DB_USER, DB_PASS } = process.env;

module.exports = {
  MongoURI: `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0-xrruv.mongodb.net/chat-app?retryWrites=true&w=majority`,
  secretOrKey: 'verySecret'
};
