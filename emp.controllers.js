import Emp from './Emp.Model.js';

export const getAllEmployers = async (req, res) => {
    // {
    //     organisation: 'Zzoomm Plc';
    // }
    const emp = await Emp.findOne({ organisation: 'Zzoomm Plc' })
        .select('county')
        .limit(5)
        .lean();
    return res.status(200).json(emp);
};

export const getSingleEmployer = async (req, res) => {
    // try {
    //     const pageNumber = req.query.page || 1; // Use query parameter for pagination
    //     const skip = (pageNumber - 1) * PAGE_SIZE;
    //     const emps = await Emp.findOne({
    //         organisation: 'Zzoomm Plc',
    //     })
    //         .skip(skip)
    //         .limit(PAGE_SIZE)
    //         .lean();
    //     return res.status(200).json(emps);
    // } catch (error) {
    //     console.error('Error retrieving employers:', error);
    //     return res
    //         .status(500)
    //         .json({ message: 'Internal server error', error: error._message });
    // }
};
