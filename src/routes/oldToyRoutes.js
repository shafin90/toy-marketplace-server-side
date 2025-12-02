const express = require('express');
const OldToyController = require('../controllers/OldToyController');
const { authenticate } = require('../middleware/auth');
const multiUpload = require('../utils/multiUpload');

const router = express.Router();

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err) {
        return res.status(400).send({ message: err.message || 'File upload error' });
    }
    next();
};

// Create old toy (with multiple image upload)
router.post('/old-toys', authenticate, multiUpload.array('images', 4), handleMulterError, OldToyController.createOldToy);

// Get old toy by ID
router.get('/old-toys/:id', OldToyController.getOldToyById);

// Get user's old toys
router.get('/old-toys', OldToyController.getUserOldToys);

// Update old toy
router.put('/old-toys/:id', authenticate, OldToyController.updateOldToy);

// Delete old toy
router.delete('/old-toys/:id', authenticate, OldToyController.deleteOldToy);

module.exports = router;

