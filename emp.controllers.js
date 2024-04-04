import Emp from './Emp.Model.js';

const PAGE_SIZE = 10;

// Retrieve all employers with pagination
export const getAllEmployers = async (req, res) => {
    // Determine the skip value for pagination
    const pageNumber = req.query.page || 1; // Use query parameter for pagination
    const skip = (pageNumber - 1) * PAGE_SIZE;

    // Query employers with pagination and convert result to plain JavaScript objects
    const emps = await Emp.find().skip(skip).limit(PAGE_SIZE).lean();

    // Send response with the list of employers
    return res.status(200).json(emps);
};

// Create a new employer
export const createEmployer = async (req, res) => {
    // Create a new employer with data from request body
    const emp = await Emp.create(req.body);

    // Send response with the created employer
    return res.status(201).json(emp);
};

// Retrieve employers based on name and town with pagination
export const getSingleEmployer = async (req, res) => {
    // Extract name and town from query parameters and trim leading/trailing spaces
    const name = (req.query.name || '').trim();
    const town = (req.query.town || '').trim();
    const searchQuery = {};
    if (req.query.name) {
        // Escape special characters in the name for use in regex
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchQuery.organisation = { $regex: new RegExp(escapedName, 'i') };
    }
    if (req.query.town) {
        searchQuery.town = { $regex: new RegExp(town, 'i') };
    }

    // Determine the skip value for pagination
    const pageNumber = req.query.page || 1; // Use query parameter for pagination
    const skip = (pageNumber - 1) * PAGE_SIZE;

    // Query employers matching the provided name and town with pagination
    const emps = await Emp.find(searchQuery).skip(skip).limit(PAGE_SIZE).lean();

    // Send response with the list of matching employers
    return res.status(200).json(emps);
};

export const deleteEmployer = async (req, res) => {
    const emp = await Emp.findByIdAndDelete(req.params.id);
    return res.status(200).json({ msg: 'deleted', emp });
};
