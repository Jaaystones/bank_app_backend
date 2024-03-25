const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', newUser});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login user
const loginUser = async (req, res) => {
    try {
      const { email, accountNumber, password } = req.body;
      let user;
      if (email) {
        // Find user by email
        user = await User.findOne({ email });
      } else if (accountNumber) {
        // Find user by account number
        const account = await Account.findOne({ accountNumber });
        if (!account) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        user = await User.findById(account.owner);
      }
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
      res.status(200).json({ messsage:`User Sucessfully Signed in ${token}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };


module.exports = {
  registerUser,
  loginUser,
};
