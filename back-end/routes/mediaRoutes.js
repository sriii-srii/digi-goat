const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const upload = require('../middleware/upload');
const isAuthenticated = require('../middleware/isAuthenticated');

// Upload multiple media files (Max 6)
router.post('/upload', isAuthenticated, upload.array('media', 6), mediaController.uploadMedia);

// Get all media for a goat
router.get('/:goatId', isAuthenticated, mediaController.getMediaByGoat);

// Delete a specific media
router.delete('/:id', isAuthenticated, mediaController.deleteMedia);

module.exports = router;
