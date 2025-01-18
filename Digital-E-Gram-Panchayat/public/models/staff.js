const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    email: String,
    password: String,
});

module.exports = mongoose.model('Staff', staffSchema);
