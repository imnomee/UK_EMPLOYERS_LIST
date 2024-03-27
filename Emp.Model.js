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
    {
        // Assign a function to the "query" object of our animalSchema through schema options.
        // By following this approach, there is no need to create a separate TS type to define the type of the query functions.
        query: {
            byOrganisation(name) {
                return this.where({ name: new RegExp(name, 'i') });
            },
        },
    }
);

// Create indexes
employerSchema.index({ organisation: 1 }); // Index on 'organisation' field

// Create a model
const Emp = mongoose.model('Employer', employerSchema);
export default Emp;
