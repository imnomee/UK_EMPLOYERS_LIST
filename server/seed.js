const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const Employer = require('./models/Employer');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Employer.deleteMany({});
        console.log('Cleared existing employers');

        // Read and parse CSV
        const employers = [];
        fs.createReadStream('./2025-12-22_-_Worker_and_Temporary_Worker.csv')
            .pipe(csv())
            .on('data', (row) => {
                employers.push({
                    name: row['Organisation Name']?.trim() || '',
                    city: row['Town/City']?.trim() || '',
                    county: row['County']?.trim() || '',
                    type: row['Type & Rating']?.trim() || '',
                    route: row['Route']?.trim() || '',
                });
            })
            .on('end', async () => {
                try {
                    await Employer.insertMany(employers);
                    console.log(`✓ Seeded ${employers.length} employers`);
                    process.exit(0);
                } catch (error) {
                    console.error('Error inserting employers:', error);
                    process.exit(1);
                }
            });
    } catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
};

seedDatabase();
