const express = require('express');
const router = express.Router();
const campaignControll = require('../controllers/campaignControll');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/add', isAuthenticated, campaignControll.createCampaign);
router.get('/active', isAuthenticated, campaignControll.viewActiveCampaigns);
router.post('/contribute', isAuthenticated, campaignControll.contributeToCampaign);

module.exports = router;
