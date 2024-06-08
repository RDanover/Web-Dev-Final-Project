async function getRoom(req, res) {
  try {
    let url = `http://localhost:3000/${req.params.roomName}/${req.params.roomID}/messages`;
    let response = await fetch(url);
    let data = await response.json();

    res.render('room', {
      title: 'Chatroom',
      roomName: req.params.roomName,
      roomID: req.params.roomID,
      messages: data,
      userEmail: req.user.email
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

module.exports = {
  getRoom
};
