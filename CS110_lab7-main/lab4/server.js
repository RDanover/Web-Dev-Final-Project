// import dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');

// import handlers
const homeHandler = require('./controllers/home.js');
const roomHandler = require('./controllers/room.js');

const Message = require('./models/Message');
const Room = require('./models/Room');

const app = express();
const port = 8080;

const uri = "mongodb+srv://rdano001:aLh2YYXddmzwTbbU@cluster0.ono5ysw.mongodb.net/sample_mflix";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    //Creating a new user
    //const user = new User({name: "Janet", email : "something@gmail.com" , password: "pwd"})
    //await user.save();
    //console.log(user);
    
  } finally {
    // Ensures that the client will close when you finish/error
    //await mongoose.disconnect();
  }
}
run().catch(console.dir);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//SERVER SIDE CODE:

//Placeholders for database

let chatrooms = [{ roomName: 'CS110', roomID: 'ABC123' },{ roomName: 'CS111', roomID: 'XYZ456' }];
let messages = [{nickname: 'Herbert', messageID:'ABC123', body: 'Enjoy it before I destroy it!'}];

app.get('/', homeHandler.getHome);//returns home page
app.get('/:roomName/:roomID', roomHandler.getRoom);//returns chatroom page of specified roomName and ID


//Placeholders for database 

app.post('/:roomName/:roomID', async (req, res) => {
      console.log('New room created');
      const room = new Room({ roomName: req.params.roomName, roomID: req.params.roomID });
      await room.save();
    });

app.get('/chatrooms', (req, res) => {//cpnnect to db
    console.log('Chatrooms requested');
    Room.find()
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: "Could not find chatrooms",
          });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Could not get chatrooms",
        });
      });
  });
  
  app.get('/:roomName/:roomID/messages', (req, res) => {//connect to db
    console.log('Messages requested');
    const roomID = req.params.roomID;
    Message.find({roomID:roomID})
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: "Could not find message with room id" + roomID,
          });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Could not find message with room id" + roomID,
        });
      });
  });
  
  app.post('/:roomName/:roomID/:messageID/:nickname/:message', async (req, res) => {
    console.log('New chat created');
    const current_time = new Date(); // Capture the current date and time
    const message = new Message({
      nickname: req.params.nickname,
      messageID: req.params.messageID,
      roomID: req.params.roomID,
      body: decodeURIComponent(req.params.message),
      date_time: current_time // Set the date_time field
    });
    await message.save();
    res.status(200).send();
  });
  
  
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));