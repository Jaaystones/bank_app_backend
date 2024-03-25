const express = require('express');
const router = express.Router();
const accountController = require('../controller/accountController');
const verifyToken = require('../middleware/authMiddleware.js')

// Create a new account
router.post('/', verifyToken, accountController.createAccount);

// Get account details
router.get('/:accountId', verifyToken, accountController.getAccount);

// Update account details
router.put('/:accountId', accountController.updateAccountBalance);

// Delete account
router.delete('/:accountId', accountController.deleteAccount);

module.exports = router;
