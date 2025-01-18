const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceName: String,
    description: String,
    cost: Number,
    availability: Boolean,
    category: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: String,
    applications: [{
        username: String,
        contact: String,
        email: String,
        dob: String,
        state: String,
        city: String,
        aadhar_number: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            default: 'pending'  // Set default to "pending"
        }
    }],
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
