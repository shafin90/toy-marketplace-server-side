const express = require('express');
const ShopController = require('../controllers/ShopController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all shops
router.get('/shops', optionalAuth, ShopController.getAllShops);

// Get shop by owner email
router.get('/shops/:shopOwnerEmail', optionalAuth, ShopController.getShopByOwner);

// Create or update shop (with image upload)
const upload = require('../utils/upload');
router.post('/shops/:shopOwnerEmail', authenticate, upload.single('shopImage'), ShopController.createOrUpdateShop);

// Add shop member
router.post('/shops/:shopOwnerEmail/members', authenticate, ShopController.addShopMember);

// Remove shop member
router.delete('/shops/:shopOwnerEmail/members/:memberEmail', authenticate, ShopController.removeShopMember);

module.exports = router;

