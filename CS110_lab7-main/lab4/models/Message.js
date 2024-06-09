const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  nickname: String,
  messageID: String,
  roomID: String,
  body: String,
  date: String, // This line adds a date_time field with a default value of the current date and time
  time: String,
  email: String
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
