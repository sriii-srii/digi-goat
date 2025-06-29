const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const isAuthenticated = require('../middleware/isAuthenticated');

// ✅ Get all health records for a goat
router.get('/goat/:goatId', isAuthenticated, healthController.getHealthRecordsByGoat);

// ✅ Add new health record
router.post('/add', isAuthenticated, healthController.addHealthRecord);

// ✅ Update existing record
router.put('/:id', isAuthenticated, healthController.updateHealthRecord);

// ✅ Delete health record
router.delete('/:id', isAuthenticated, healthController.deleteHealthRecord);

// ✅ Get latest health status for a goat
router.get('/latest/:goatId', isAuthenticated, healthController.getLatestHealthStatus);

module.exports = router;
