const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    roomName:String,
    roomID: String
})

const Room = mongoose.model('Room', RoomSchema)

module.exports = Room