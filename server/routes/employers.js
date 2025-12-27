const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');

router.get('/', employerController.getAllEmployers);
router.get('/search', employerController.searchEmployers);
router.get('/status/filter', employerController.getByStatus);
router.get('/:id', employerController.getEmployer);
router.post('/', employerController.createEmployer);
router.put('/:id', employerController.updateEmployer);
router.patch('/:id/toggle-removal', employerController.toggleRemoval);
router.delete('/:id', employerController.deleteEmployer);

module.exports = router;
