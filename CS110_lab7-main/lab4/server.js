// import dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');

// import handlers
const homeHandler = require('./controllers/home.js');
const roomHandler = require('./controllers/room.js');
const authHandler = require('./controllers/auth.js');
const landingHandler = require('./controllers/landing.js');

const Message = require('./models/Message');
const Room = require('./models/Room');
const User = require('./models/User');

const app = express();
const port = 3000;

const uri = "mongoDB URI here";
const clientOptions = { serverApi: { version: '1', strict: false, deprecationErrors: true } };

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
}

app.post('/google-signin', async (req, res) => {
  const { email, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // User does not exist, create a new user
      user = new User({ email, name });
      await user.save();
    }

    const token = jwt.sign({ email: user.email, name: user.name, id: user._id }, 'your_jwt_secret_key', { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    return res.status(200).json({ message: 'Login successful' }); // Ensure to return the response
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again.' }); // Ensure to return the response
  }
});

// SERVER SIDE CODE:
app.get('/', landingHandler.getLanding);
app.get('/home', authenticateToken, homeHandler.getHome); // returns home page
app.get('/:roomName/:roomID', authenticateToken, roomHandler.getRoom); // returns chatroom page of specified roomName and ID

app.get('/login', authHandler.getLogin); // returns login page
app.post('/login', authHandler.postLogin);
app.get('/signup', authHandler.getSignup); // returns sign in page
app.post('/signup', authHandler.postSignup);
app.put('/:roomName/:roomID/:messageID/edit', authenticateToken, roomHandler.editMessage);
app.delete('/:roomName/:roomID/:messageID/delete', authenticateToken, roomHandler.deleteMessage);
app.get('/:roomName/:roomID/search-date/:search_date', roomHandler.searchMessageDate);
app.get('/:roomName/:roomID/search-message/:search_term', roomHandler.searchMessage);

app.post('/:roomName/:roomID', async (req, res) => {
  console.log('New room created');
  const room = new Room({ roomName: sanitizeHtml(req.params.roomName), roomID: req.params.roomID });
  await room.save();
});

app.get('/chatrooms', (req, res) => {
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

app.get('/:roomName/:roomID/messages', (req, res) => {
  console.log('Messages requested');
  const roomID = req.params.roomID;
  Message.find({ roomID: roomID })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: "Could not find message with room id " + roomID,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not find message with room id " + roomID,
      });
    });
});

app.post('/:roomName/:roomID/:messageID/:nickname/:message/:email', async (req, res) => {
  console.log('New chat created');
  const current_time = new Date(); // Capture the current date and time
  const message = new Message({
    nickname: sanitizeHtml(req.params.nickname),
    messageID: req.params.messageID,
    roomID: req.params.roomID,
    body: sanitizeHtml(decodeURIComponent(req.params.message)),
    date: formatDate(current_time), // Extract and set the date
    time: formatTime(current_time), // Extract and set the time
    email: req.params.email
  });
  await message.save();
  res.status(200).send();
});

// Function to format date as mm-dd-yyyy
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

// Function to format time as hh:mm
function formatTime(date) {
  let hours_int = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  let time = " am";
  if (hours_int > 12) {
    hours_int -= 12;
    time = " pm";
  }
  const hours = String(hours_int).padStart(2, '0');
  return `${hours}:${minutes}` + time;
}

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
