const mongoose = require('mongoose');
const fs = require('fs');
const State = require('./public/models/city-states');

// MongoDB connection string
mongoose.connect('mongodb+srv://admin:admin123@cluster0.vbnro.mongodb.net/')
    .then(() => console.log('Connected to the database'))
    .catch((error) => console.log('Database connection error:', error));

// Load the cities data from the JSON file
const citiesData = JSON.parse(fs.readFileSync('states-cities.json', 'utf8'));

// Group cities by state
const citiesByState = citiesData.reduce((acc, city) => {
    if (!acc[city.state]) {
        acc[city.state] = [];
    }
    acc[city.state].push({ name: city.name });
    return acc;
}, {});

// Insert states and their cities into the database
const insertStates = async () => {
    for (const stateName in citiesByState) {
        const newState = new State({
            name: stateName,
            cities: citiesByState[stateName]
        });

        try {
            await newState.save();
            console.log(`${stateName} added with cities`);
        } catch (error) {
            console.error(`Error adding state ${stateName}:`, error);
        }
    }
};

// Call the insert function
insertStates()
    .then(() => mongoose.connection.close())
    .catch((error) => {
        console.error('Error in insertion:', error);
        mongoose.connection.close();
    });