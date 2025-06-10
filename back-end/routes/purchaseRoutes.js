const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

router.post('/buy', purchaseController.purchaseGoat);
router.get('/my', purchaseController.getMyPurchases);
router.post('/review', purchaseController.submitReview);

module.exports = router;
