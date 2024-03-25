const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountNumber: { 
    type: String, 
    required: true, 
    unique: true 
},
  balance: { 
    type: Number, 
    required: true, 
    default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
