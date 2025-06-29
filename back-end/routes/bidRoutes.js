const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/place', isAuthenticated, bidController.placeBid);
router.get('/history', isAuthenticated, bidController.getBidHistory);


module.exports = router;
