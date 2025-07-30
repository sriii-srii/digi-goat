const express = require('express');
const router = express.Router();
const db = require('../config/db');

const adminController = require('../controllers/adminController');
const isAuthenticated = require('../middleware/isAuthenticated');


// 🐐 Goat Requests
router.get('/goat-requests', isAuthenticated,  adminController.getGoatRequests);
router.patch('/goat-requests/:id', isAuthenticated, adminController.updateGoatStatus);

// 👤 View Customer Profile
router.get('/customer/:id', isAuthenticated,  adminController.getCustomerProfile);

// 📢 Campaigns
router.get('/campaigns', isAuthenticated, adminController.getAllCampaigns);
router.patch('/campaigns/:id/status', isAuthenticated,  adminController.updateCampaignStatus);

module.exports = router;
