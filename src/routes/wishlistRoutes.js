const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/WishlistController');

// Wishlist routes
router.post('/wishlist', WishlistController.addToWishlist);
router.delete('/wishlist/:toyId', WishlistController.removeFromWishlist);
router.get('/wishlist/:userEmail', WishlistController.getUserWishlist);

module.exports = router;

