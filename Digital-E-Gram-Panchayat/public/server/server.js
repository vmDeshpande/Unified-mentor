// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Initialize Express app
const app = express();
const PORT = 3000;

// Generate a secret key for sessions
const secretKey = crypto.randomBytes(64).toString('hex');

// Middleware setup
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
}));
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(express.static("public")); // Serve static files from the "public" directory
app.set("view engine", "ejs"); // Set EJS as the template engine

// Connect to MongoDB
try {
    mongoose.connect('mongodb+srv://admin:admin123@cluster0.vbnro.mongodb.net/');
    console.log("Database Connected")
} catch (error) {
    console.error(error.message);
}

// Import models
const User = require('../models/user');
const Staff = require('../models/staff');
const Admin = require('../models/admin');
const Service = require('../models/service');
const State = require('../models/city-states');

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Check authentication status
app.get('/api/check-auth-status', (req, res) => {
    const isAuthenticated = req.session.user || req.session.staff || req.session.admin;
    const isUser = req.session.user !== undefined;
    const isStaff = req.session.staff !== undefined;
    const isAdmin = req.session.admin !== undefined;
    res.json({ isAuthenticated, isUser, isStaff, isAdmin });
});

// User registration
app.post('/api/register-user', async (req, res) => {
    const { username, contact, email, dob, state, city, aadhar_number, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username, contact, email, dob, state, city, aadhar_number,
            password: hashedPassword 
        });
        await newUser.save();
        res.json({ message: 'User registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// User login
app.post('/api/login-user', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            res.json({ message: 'User login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Admin login
app.post('/api/login-admin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email, password });
        if (admin) {
            req.session.admin = admin;
            res.json({ message: 'Admin login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Staff login
app.post('/api/login-staff', async (req, res) => {
    const { email, password } = req.body;
    try {
        const staff = await Staff.findOne({ email, password });
        if (staff) {
            req.session.staff = staff;
            res.json({ message: 'Staff login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ message: 'Logout failed' });
        } else {
            res.json({ message: 'Logout successful' });
        }
    });
});

// Create new service (admin only)
app.post('/api/new-service', async (req, res) => {
    if (!req.session.admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { serviceName, description, cost, availability, category } = req.body;
    try {
        const service = await Service.findOne({ 'serviceName': serviceName });
        if (service) {
            return res.status(409).json({ message: 'Service already exists' });
        }
        const newService = new Service({
            serviceName, description, cost, availability, category,
            createdBy: req.session.admin.email,
            applications: []
        });
        await newService.save();
        res.json({ message: 'Service created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Service creation failed', error: error.message });
    }
});

// Get all services
app.get('/api/get-services-listings', async (req, res) => {
    try {
        const servicesListings = await Service.find();
        res.json(servicesListings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job listings', error: error.message });
    }
});

// Apply for a service
app.post('/api/apply-for-service', async (req, res) => {
    if (req.session.admin || req.session.staff) {
        return res.status(401).json({ message: 'Admin/Staff cannot apply for service' });
    }
    const { serviceName } = req.body;
    const { username, contact, email, dob, state, city, aadhar_number } = req.session.user;
    try {
        const service = await Service.findOne({ serviceName });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        const alreadyApplied = service.applications.some(application => application.email === email);
        if (alreadyApplied) {
            return res.status(400).json({ message: 'You have already applied for this service.' });
        }
        const newApplication = { username, contact, email, dob, state, city, aadhar_number };
        const updatedService = await Service.findOneAndUpdate(
            { serviceName },
            { $push: { applications: newApplication } },
            { new: true }
        );
        if (!updatedService) {
            return res.status(404).json({ message: 'Error adding application to service' });
        }
        res.json({ message: 'Application submitted successfully', updatedService });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
});

// Delete a service
app.delete('/api/delete-service/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete service', error: error.message });
    }
});

// Update a service
app.put('/api/update-service/:id', async (req, res) => {
    const serviceId = req.params.id;
    const { serviceName, description, cost, availability, category } = req.body;
    try {
        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            { serviceName, description, cost, availability, category },
            { new: true }
        );
        res.json({ message: "Service updated successfully", service: updatedService });
    } catch (error) {
        res.status(500).json({ message: "Error updating service", error });
    }
});

// Get a specific service
app.get('/api/get-service/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: "Service", service: service });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service applications', error });
    }
});

// Get applications for a specific service (admin/staff only)
app.get('/api/get-applications/:serviceName', async (req, res) => {
    if (req.session.admin || req.session.staff) {
        const { serviceName } = req.params;
        try {
            const service = await Service.findOne({ serviceName });
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            const applications = service.applications;
            res.json({ message: 'Applications fetched successfully', applications });
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ message: 'Error fetching applications', error: error.message });
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
});

// Get applications for a specific user
app.get('/api/get-user-applications', async (req, res) => {
    if (req.session.user) {
        const { email } = req.session.user;
        try {
            const services = await Service.find({ 'applications.email': email });
            if (services.length === 0) {
                return res.status(200).json({ message: 'No applications found for this user', services: [] });
            }
            res.json({ message: 'User applications fetched successfully', services });
        } catch (error) {
            console.error('Error fetching user applications:', error);
            res.status(500).json({ message: 'Error fetching user applications', error: error.message });
        }
    } else {
        return res.status(401).json({ message: 'User not authenticated' });
    }
});

// Update application status
app.post('/api/update-application-status', async (req, res) => {
    try {
        const { applicationId, status } = req.body;
        const updatedService = await Service.findOneAndUpdate(
            { 'applications._id': applicationId },
            { $set: { 'applications.$.status': status } },
            { new: true }
        );
        if (!updatedService) {
            return res.status(404).json({ message: 'Application not found or status update failed' });
        }
        res.json({ message: 'Application status updated successfully', updatedService });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating application status', error });
    }
});

// Get all states
app.get('/api/states', async (req, res) => {
    try {
        const states = await State.find();
        res.json(states);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching states', error: error.message });
    }
});

// Get cities by state
app.get('/api/cities/:stateName', async (req, res) => {
    try {
        const state = await State.findOne({name: req.params.stateName});
        if (state) {
            res.json(state.cities);
        } else {
            res.status(404).json({ message: 'State not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cities', error: error.message });
    }
});

// Get user profile data 
app.get('/api/user-profile', async (req, res) => {
    if (req.session.user) {
        const username = req.session.user.username;
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'User profile fetched successfully', user });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ message: 'Error fetching user profile', error: error.message });
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
});