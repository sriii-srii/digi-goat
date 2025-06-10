const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Get records for a goat
router.get('/goat/:goatId', isAuthenticated, healthController.getHealthRecordsByGoat);

// Add new health record
router.post('/add', isAuthenticated, healthController.addHealthRecord);

// Update record
router.put('/:id', isAuthenticated, healthController.updateHealthRecord);

// Delete record
router.delete('/:id', isAuthenticated, healthController.deleteHealthRecord);

module.exports = router;
