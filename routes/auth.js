const express = require('express');
const asyncHandler = require('express-async-handler');
const { registerUser, loginUser } = require('../controller/authController.js');

const router = express.Router();

// User registration route
router.post('/register', asyncHandler(registerUser));

// User login route
router.post('/login', asyncHandler(loginUser));

module.exports = router;
