const express = require('express');
const router = express.Router();
const goatController = require('../controllers/goatController');
const upload = require('../middleware/upload');
const isAuthenticated = require('../middleware/isAuthenticated');

// 🔒 Only authenticated users allowed on these routes
router.post('/add', isAuthenticated, upload.single('image'), goatController.addGoat);
router.get('/my', isAuthenticated, goatController.getMyGoats);
router.put('/:id/update', isAuthenticated, upload.single('image'), goatController.updateGoat);
router.delete('/delete/:id', isAuthenticated, goatController.deleteGoat);

// 🛍️ New market route (goats by other users)
router.get('/market', isAuthenticated, goatController.getMarketGoats);

module.exports = router;
