const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  nickname: String,
  messageID: String,
  roomID: String,
  body: String,
  date_time: {type: Date} // This line adds a date_time field with a default value of the current date and time
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
