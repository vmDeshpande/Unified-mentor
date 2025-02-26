const mongoose = require('mongoose');

// Define the schema for pickup requests
const pickupRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    carDetails: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        default: '' // Optional field
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically sets the request creation time
    }
});

// Create the model
const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);

module.exports = PickupRequest;
