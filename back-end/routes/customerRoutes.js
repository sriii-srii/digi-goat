const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer_controller');

// ✅ GET /api/customers/profile
router.get('/profile', customerController.getCustomerProfile);

module.exports = router;
