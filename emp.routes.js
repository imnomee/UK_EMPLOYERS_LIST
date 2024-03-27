import { Router } from 'express';
import { getAllEmployers, getSingleEmployer } from './emp.controllers.js';

const router = Router();

router.get('/', getAllEmployers);
router.get('/:name', getSingleEmployer);

export default router;
