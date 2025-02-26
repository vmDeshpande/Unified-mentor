const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    stationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Station' },
    stationName: { type: String, required: true },
    stationLat: { type: String, required: true },
    stationLng: { type: String, required: true },
    distance: { type: String, required: true },
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: { type: String, required: true },
        contact: { type: String, required: true },
        email: { type: String, required: true },
    },
    car: {
        name: { type: String, required: true },
        model: { type: String, required: true },
    },
    slot: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
