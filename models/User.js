const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true        
    },
    country: { type: String, required: true },
    selfie: { type: String},
    bvn: { type: String, required: [true, "Value should not be less than 10"] },
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true },
    email: {
        type: String,
        required: [true, "Please insert a mail"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email",
        ],
    },
    password:{
        type: String,
        required:[true, "Please enter a valid password"],
        minLength:[6, "Password must not be less than 6 characters"]
    },
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }]
},
{timestamps: true},
)


// encrypt password every time you access it before saving it to dB
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;