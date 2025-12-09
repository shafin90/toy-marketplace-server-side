const WishlistService = require('../services/WishlistService');

const WishlistController = {
    addToWishlist: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { toyId } = req.body;

            if (!userEmail || !toyId) {
                return res.status(400).json({ message: 'User email and toy ID are required' });
            }

            const wishlistItem = await WishlistService.addToWishlist(userEmail, toyId);
            res.status(201).json(wishlistItem);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    removeFromWishlist: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { toyId } = req.params;

            if (!userEmail || !toyId) {
                return res.status(400).json({ message: 'User email and toy ID are required' });
            }

            await WishlistService.removeFromWishlist(userEmail, toyId);
            res.json({ message: 'Removed from wishlist' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getUserWishlist: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const wishlist = await WishlistService.getUserWishlist(userEmail);
            res.json(wishlist);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = WishlistController;

