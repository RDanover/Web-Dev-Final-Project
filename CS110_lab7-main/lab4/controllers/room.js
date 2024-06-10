const Message = require('../models/Message');
const sanitizeHtml = require('sanitize-html');

async function getRoom(req, res) {
    try {
        let url = 'http://localhost:3000/' + sanitizeHtml(req.params.roomName) + '/' + req.params.roomID + '/messages';
        let response = await fetch(url);
        let data = await response.json();
        res.render('room', {
            title: req.params.roomName,
            roomName: sanitizeHtml(req.params.roomName),
            roomID: req.params.roomID,
            messages: data,
            userName: sanitizeHtml(req.user.name),
            userEmail: sanitizeHtml(req.user.email)
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

async function editMessage(req, res) {
  const { roomName, roomID, messageID } = req.params;
  const { body } = req.body;
  console.log("roomID:",roomID)
  console.log("messageID:",messageID)
  try {
      const updatedMessage = await Message.updateOne({ roomID: roomID, messageID:messageID }, { $set:{body:sanitizeHtml(body)}} );
      console.log(updatedMessage)
      if (!updatedMessage) {
          console.log("Message not found");
          return res.status(404).json({ message: 'Message not found' });
      }
      console.log("Message updated successfully");
      res.status(200).json({ message: 'Message updated successfully' });
  } catch (error) {
      console.error("Failed to update message:", error);
      res.status(500).json({ message: 'Failed to update message' });
  }
}

async function deleteMessage(req, res) {
  const { roomName, roomID, messageID } = req.params;
  console.log("roomID:",roomID)
  console.log("messageID:",messageID)
  try {
      const deletedMessage = await Message.deleteOne({ roomID: roomID, messageID:messageID });
      console.log(deletedMessage)
      if (!deletedMessage) {
          console.log("Message not found");
          return res.status(404).json({ message: 'Message not found' });
      }
      console.log("Message deleted successfully");
      res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
      console.error("Failed to delete message:", error);
      res.status(500).json({ message: 'Failed to delete message' });
  }
}

async function searchMessageDate(req, res) {
  const { roomName, roomID, search_date } = req.params;
  try {
    const messages = await Message.find({ date:search_date, roomID:roomID });
    if (messages.length===0) {
      return res.status(404).send({
        message: `Could not find message with date"${search_date}" in this chatroom`,
      });
    }
    else{
      res.send(messages);
    }
  } catch (error) {
    console.error('Error searching for messages:', error);
    res.status(500).send({
      message: `Could not get message with date "${search_date}" in this chatroom`,
    });
  }
}

async function searchMessage(req, res) {
  const { roomName, roomID, search_term } = req.params;
  try {
    const messages = await Message.aggregate([
      {
        $search: {
          index: "default",
          text: {
            query: sanitizeHtml(search_term),
            path: {
              wildcard: "*"
            }
          }
        }
      },
      {
        $match: {
          roomID: roomID
        }
      }
    ]);
    if (messages.length===0) {
      return res.status(404).send({
        message: `Could not find message with term/phrase "${sanitizeHtml(search_term)}" in this chatroom`,
      });
    }
    res.send(messages);
  } catch (error) {
    console.error('Error searching for messages:', error);
    res.status(500).send({
      message: `Could not get message with term/phrase "${sanitizeHtml(search_term)}" in this chatroom`,
    });
  }
}


module.exports = {
    getRoom,
    editMessage,
    deleteMessage,
    searchMessageDate,
    searchMessage
};

