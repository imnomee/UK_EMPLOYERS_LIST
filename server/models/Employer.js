const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        county: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            trim: true,
        },
        route: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'interested', 'not-interested'],
            default: 'pending',
        },
        toRemove: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            trim: true,
        },
        lastContacted: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Employer', employerSchema);
