const express = require('express');
// const asyncHandler = require('express-async-handler');
const { signUp, login, refresh, logout } = require('../controller/authController.js');

const router = express.Router();

// User registration route
// router.post('/register', registerUser);

// User login route
router.post('/login', (login));
router.post('/logout', (logout));
router.get('/refresh', (refresh));
router.post('/signup', (signUp));


module.exports = router;
