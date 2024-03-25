// routes/protectedRoute.js

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

// Protected route
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'You are authorized to access this route', user: req.user });
});

module.exports = router;
