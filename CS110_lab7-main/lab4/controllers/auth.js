const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getLogin = (req, res) => {
  res.render('login');
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ email: user.email, name:user.name, id: user._id }, 'your_jwt_secret_key', { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });
  res.status(200).json({ message: 'Login successful' });
};

exports.getSignup = (req, res) => {
  res.render('signup');
};

exports.postSignup = async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, name });
  await user.save();

  const token = jwt.sign({ email: user.email, name:user.name, id: user._id }, 'your_jwt_secret_key', { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });
  res.status(200).json({ message: 'Signup successful' });
};

