import { Router } from 'express';
import {
    createEmployer,
    deleteEmployer,
    getAllEmployers,
    getSingleEmployer,
} from './emp.controllers.js';

const router = Router();

router.route('/').get(getAllEmployers).post(createEmployer);
router.route('/:id').delete(deleteEmployer);
router.get('/search', getSingleEmployer);

export default router;
