const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campaignController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/add', isAuthenticated, ctrl.createCampaign);
router.get('/active', isAuthenticated, ctrl.viewActiveCampaigns);
router.post('/contribute', isAuthenticated, ctrl.contributeToCampaign);
router.get('/:id/contributors', isAuthenticated, ctrl.getContributors);
router.get('/my-contributions', isAuthenticated, ctrl.myContributions);

module.exports = router;
