
async function getRoom(req, res){
  try {
    let url = 'http://localhost:8080/'+req.params.roomName+'/'+req.params.roomID+'/messages'
    let response = await fetch(url);
    console.log(response.status); // 200
    console.log(response.statusText); // OK
    let data = await response.json();
    console.log(data);
    res.render('room', {title: 'Chatroom',roomName: req.params.roomName, roomID: req.params.roomID, messages: data});
    
} 
  catch (error) {
    console.error('Error fetching messages:', error);
  }
    
}

module.exports = {
    getRoom
};