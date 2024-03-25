// accountController.js

const asyncHandler = require('express-async-handler');
const Account = require('../models/Account');

// @desc    Create a new account
// @route   POST /api/accounts
// @access  Public
const createAccount = asyncHandler(async (req, res) => {
  const { accountNumber, balance } = req.body;

  // Validation: Check if required fields are provided
  if (!accountNumber || !balance) {
    return res.status(400).json({ message: 'Account number and balance are required' });
  }

  try {
    // Create a new account
    const account = await Account.create(req.body);
    res.status(201).json({ message: `Account created successfully ${account}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get account details
// @route   GET /api/accounts/:accountId
// @access  Public
const getAccount = asyncHandler(async (req, res) => {
  const accountId = req.params.accountId;

  try {
    // Find account by ID
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update account details
// @route   PUT /api/accounts/:accountId
// @access  Public
const updateAccountBalance = asyncHandler(async (req, res) => {
    const accountId = req.params.accountId;
    const { type, amount } = req.body;
  
    try {
      // Find account by ID
      const account = await Account.findById(accountId);
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
  
      // Update balance based on transaction type
      if (type === 'deposit') {
        account.balance += amount; // Increase balance for deposit
      } else if (type === 'withdrawal') {
        if (amount > account.balance) {
          return res.status(400).json({ message: 'Insufficient funds' });
        }
        account.balance -= amount; // Decrease balance for withdrawal
      } else {
        return res.status(400).json({ message: 'Invalid transaction type' });
      }
  
      // Save updated account
      await account.save();
      
      res.json({ message: 'Account balance updated successfully', newBalance: account.balance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

// @desc    Delete account
// @route   DELETE /api/accounts/:accountId
// @access  Public
const deleteAccount = asyncHandler(async (req, res) => {
  const accountId = req.params.accountId;

  try {
    // Find account by ID and delete it
    const account = await Account.findByIdAndDelete(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = {
  createAccount,
  getAccount,
  updateAccountBalance,
  deleteAccount,
};
