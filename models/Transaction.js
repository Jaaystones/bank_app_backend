const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'transfer'], 
    required: true },
  amount: { 
    type: Number, 
    required: true },
  fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  timestamp: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
