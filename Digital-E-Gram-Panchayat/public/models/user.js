const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    contact: String,
    email: String,
    dob: String,
    state: String,
    city: String,
    aadhar_number: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
