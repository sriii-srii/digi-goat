const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist_controller');

router.get('/my', wishlistController.getMyWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove/:goatId', wishlistController.removeFromWishlist);

module.exports = router;
