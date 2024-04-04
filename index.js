import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';
import empRoutes from './emp.routes.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use('/api/v1/list', empRoutes);

// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found: 404' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong: 500' });
});

async function startServer() {
    try {
        // Check if MONGO_URI environment variable is provided
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not provided.');
        }

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully.');

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on: ${PORT}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

startServer();
