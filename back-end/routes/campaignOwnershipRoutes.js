const express = require('express');
const router = express.Router();
const controller = require('../controllers/campaignOwnershipController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/:id/contributors', isAuthenticated, controller.getContributors);

module.exports = router;
