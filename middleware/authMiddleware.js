const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const verifyToken = asyncHandler(async (req, res, next) => {
  // Get token from headers
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Find user by decoded user ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Attach user object to request for use in protected routes
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

module.exports = verifyToken;
