const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    types: [String],  // Array of plug types
    availability: { type: Boolean, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
});

module.exports = mongoose.model('Station', stationSchema);
