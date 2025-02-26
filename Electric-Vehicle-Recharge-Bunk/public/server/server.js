const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const crypto = require('crypto');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const secretKey = crypto.randomBytes(64).toString('hex');
const app = express();

console.log(secretKey);

// Middleware setup
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));
app.set('view engine', 'ejs');

// MongoDB Connection
const PORT = process.env.PORT || 3000;
try {
    mongoose.connect('mongodb+srv://admin:admin123@cluster0.nsnnk.mongodb.net/');
    console.log("Database Connected");
} catch (error) {
    console.error(error.message);
}

// MongoDB Models
const User = require('../models/user.js');
const Admin = require('../models/admin.js');
const Station = require('../models/station.js');
const Booking = require('../models/booking.js');
const PickupRequest = require('../models/pickupRequest');

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'template', 'index.html'));
});

// User Registration
app.post('/register/user', async (req, res) => {
    const { username, contact, email, password } = req.body;
    try {
        const newUser = new User({ username, contact, email, password });
        await newUser.save();
        res.json({ message: 'User registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// User Login
app.post('/login/user', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            req.session.user = user;
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});
// Admin Login
app.post('/login/admin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email, password });
        if (admin) {
            req.session.admin = admin;
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

app.get('/check-auth-status', (req, res) => {
    const isAuthenticated = req.session.user || req.session.admin;

    const isAdmin = req.session.admin !== undefined;
    const isUser = req.session.user !== undefined;

    res.json({ isAuthenticated, isAdmin, isUser });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).json({ message: 'Logout failed' });
        } else {
            res.json({ message: 'Logout successful' });
        }
    });
});


// Endpoint to add a new station
app.post('/add-station', async (req, res) => {
    const { name, location, types, availability, lat, lng } = req.body;

    try {
        const newStation = new Station({
            name,
            location,
            types,
            availability,
            lat,
            lng
        });

        await newStation.save();
        res.json({ message: 'Station added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add station', error: error.message });
    }
});

// Get all stations (Admin view)
app.get('/stations', async (req, res) => {
    try {
        const stations = await Station.find();

        // Update each station's availability based on booked slots
        for (const station of stations) {
            const bookedSlots = await Booking.countDocuments({ stationId: station._id });

            // If all slots are booked, set availability to false (Occupied)
            if (bookedSlots >= 12) {
                station.availability = false;
            } else {
                station.availability = true;
            }

            // Save the updated station document
            await station.save();
        }

        res.json(stations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stations', error: error.message });
    }
});

app.get('/pickupRequests', async (req, res) => {
    try {
        const pickupRequests = await PickupRequest.find();
        res.json(pickupRequests);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stations', error: error.message });
    }
});

// Delete a station (Admin only)
app.delete('/delete-station/:id', async (req, res) => {
    try {
        const station = await Station.findByIdAndDelete(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'Station not found' });
        }
        res.json({ message: 'Station deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete station', error: error.message });
    }
});

// Delete pickup request (Admin only)
app.delete('/delete-pickup/:id', async (req, res) => {
    try {
        const station = await PickupRequest.findByIdAndDelete(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'pickup request not found' });
        }
        res.json({ message: 'pickup request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to pickup request', error: error.message });
    }
});

// Route to handle receiving station details
app.post('/send-station-details', async (req, res) => {
    const { stationId, stationName, stationLat, stationLng, distance, userdata, carName, carModel, slot } = req.body;

    try {

        // Validate the slot field
        if (!slot) {
            return res.status(400).json({ message: 'Slot is required' });
        }

        const newBooking = new Booking({
            stationId,
            stationName,
            stationLat,
            stationLng,
            distance,
            user: {
                _id: userdata._id,
                username: userdata.username,
                contact: userdata.contact,
                email: userdata.email,
            },
            car: {
                name: carName,
                model: carModel,
            },
            slot,
        });

        await newBooking.save();

        res.json({ message: 'Booking saved successfully!' });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ message: 'Failed to save booking' });
    }
});

app.post('/submit-booking', async (req, res) => {
    const {
        stationId,
        stationName,
        stationLat,
        stationLng,
        distance,
        userdata,
        carName,
        carModel,
        slot
    } = req.body;

    try {
        // Validate required fields
        if (!stationId || !stationName || !stationLat || !stationLng || !distance || !userdata || !carName || !carModel || !slot) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Save the booking to the database
        const newBooking = new Booking({
            stationId,
            stationName,
            stationLat,
            stationLng,
            distance,
            user: {
                _id: userdata._id,
                username: userdata.username,
                contact: userdata.contact,
                email: userdata.email,
            },
            car: {
                name: carName,
                model: carModel,
            },
            slot,
        });

        await newBooking.save();
        res.json({ message: 'Booking saved successfully!', booking: newBooking });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ message: 'Failed to save booking' });
    }
});

// Define the route to check if a slot is booked
app.post('/check-slot-availability', async (req, res) => {
    const { stationName, stationLat, stationLng, slot } = req.body;

    try {
        // Find the booking with the given station details and slot
        const existingBooking = await Booking.findOne({
            stationName,
            stationLat,
            stationLng,
            slot
        });

        // If booking exists, it means the slot is already booked
        if (existingBooking) {
            return res.json({ message: 'Slot is booked', booked: true });
        }

        // If no booking exists, the slot is available
        return res.json({ message: 'Slot is available', booked: false });

    } catch (error) {
        console.error('Error checking slot availability:', error);
        res.status(500).json({ message: 'Error checking slot availability' });
    }
});

// Get user bookings based on their email and contact number
app.get('/user-panel', async (req, res) => {
    const { email, contact } = req.query;  // Assuming the logged-in user's email and contact are passed

    try {
        // Find bookings that match the email and contact number
        const userBookings = await Booking.find({
            'user.email': email,
            'user.contact': contact
        });

        if (userBookings.length === 0) {
            return res.json({ message: 'No bookings found for this user' });
        }

        // Send the user bookings data to the client
        res.json({ bookings: userBookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Failed to fetch user bookings' });
    }
});

app.get('/pick-up-user', async (req, res) => {
    const { email, contact } = req.query;  // Assuming the logged-in user's email and contact are passed

    try {
        // Find bookings that match the email and contact number
        const userPickupRequest = await PickupRequest.find({
            email: email,
            contact: contact
        });

        if (userPickupRequest.length === 0) {
            return res.json({ message: 'No Pickup Request found for this user' });
        }

        // Send the user bookings data to the client
        res.json({ PickupRequest: userPickupRequest });
    } catch (error) {
        console.error('Error fetching user Pickup Request:', error);
        res.status(500).json({ message: 'Failed to fetch user Pickup Request' });
    }
});

// API endpoint to handle form submissions
app.post('/api/pickup-requests', async (req, res) => {
    try {
        const pickupRequest = new PickupRequest(req.body);
        try {
            await pickupRequest.save();
            
        } catch (error) {
            console.error('Error saving pickup request:', error);
        }
        res.status(201).json({ message: 'Pickup request created successfully!', data: pickupRequest });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create pickup request.', error: error.message });
    }
});

// Listen on Port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
