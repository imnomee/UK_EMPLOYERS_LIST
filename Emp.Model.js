import mongoose from 'mongoose';

// Define the schema for the document
const employerSchema = new mongoose.Schema(
    {
        organisation: String,
        town: String,
        county: String,
        typeRating: String,
        route: String,
    },
    { timestamps: true }
);

// Create indexes
employerSchema.index({ organisation: 1 }); // Index on 'organisation' field

// Create a model
const Emp = mongoose.model('Employer', employerSchema);
export default Emp;
