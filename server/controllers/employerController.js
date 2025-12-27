const Employer = require('../models/Employer');

// Get all employers with pagination
exports.getAllEmployers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Employer.countDocuments();
        const employers = await Employer.find().skip(skip).limit(limit);

        res.json({
            data: employers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single employer
exports.getEmployer = async (req, res) => {
    try {
        const employer = await Employer.findById(req.params.id);
        if (!employer)
            return res.status(404).json({ message: 'Employer not found' });
        res.json(employer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create employer
exports.createEmployer = async (req, res) => {
    const employer = new Employer(req.body);
    try {
        const newEmployer = await employer.save();
        res.status(201).json(newEmployer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update employer
exports.updateEmployer = async (req, res) => {
    try {
        const employer = await Employer.findById(req.params.id);
        if (!employer)
            return res.status(404).json({ message: 'Employer not found' });

        if (req.body.name) employer.name = req.body.name;
        if (req.body.city) employer.city = req.body.city;
        if (req.body.county) employer.county = req.body.county;
        if (req.body.type) employer.type = req.body.type;
        if (req.body.route) employer.route = req.body.route;
        if (req.body.website) employer.website = req.body.website;
        if (req.body.contactPerson)
            employer.contactPerson = req.body.contactPerson;
        if (req.body.email) employer.email = req.body.email;
        if (req.body.status) employer.status = req.body.status;
        if (req.body.notes) employer.notes = req.body.notes;
        if (req.body.lastContacted)
            employer.lastContacted = req.body.lastContacted;
        if (typeof req.body.toRemove === 'boolean')
            employer.toRemove = req.body.toRemove;

        const updated = await employer.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete employer
exports.deleteEmployer = async (req, res) => {
    try {
        const employer = await Employer.findByIdAndDelete(req.params.id);
        if (!employer)
            return res.status(404).json({ message: 'Employer not found' });
        res.json({ message: 'Employer deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search employers with pagination
exports.searchEmployers = async (req, res) => {
    try {
        const { name, city, type, route } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (name) filter.name = new RegExp(name, 'i');
        if (city) filter.city = new RegExp(city, 'i');
        if (type) filter.type = new RegExp(type, 'i');
        if (route) filter.route = new RegExp(route, 'i');

        const total = await Employer.countDocuments(filter);
        const employers = await Employer.find(filter).skip(skip).limit(limit);

        res.json({
            data: employers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get employers by status
exports.getByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : { toRemove: false };
        const employers = await Employer.find(filter).limit(500);
        res.json(employers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle removal flag
exports.toggleRemoval = async (req, res) => {
    try {
        const employer = await Employer.findById(req.params.id);
        if (!employer)
            return res.status(404).json({ message: 'Employer not found' });
        employer.toRemove = !employer.toRemove;
        const updated = await employer.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
