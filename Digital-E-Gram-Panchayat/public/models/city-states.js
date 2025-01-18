const mongoose = require('mongoose');

// State and City schema
const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const stateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    cities: [citySchema]
});

const State = mongoose.model('State', stateSchema);

module.exports = State;
