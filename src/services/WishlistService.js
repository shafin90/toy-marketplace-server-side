const WishlistModel = require('../models/WishlistModel');
const ToyModel = require('../models/ToyModel');
const NotificationModel = require('../models/NotificationModel');

const WishlistService = {
    addToWishlist: async (userEmail, toyId) => {
        // Verify toy exists
        const toy = await ToyModel.findById(toyId);
        if (!toy) {
            throw new Error('Toy not found');
        }

        const wishlistItem = await WishlistModel.addToWishlist(userEmail, toyId);

        // Create notification if price drops or toy becomes available
        if (toy.status === 'available') {
            await NotificationModel.create({
                userEmail,
                type: 'wishlist_added',
                title: 'Added to Wishlist',
                message: `${toy.name} has been added to your wishlist`,
                toyId: toyId
            });
        }

        return wishlistItem;
    },

    removeFromWishlist: async (userEmail, toyId) => {
        return await WishlistModel.removeFromWishlist(userEmail, toyId);
    },

    getUserWishlist: async (userEmail) => {
        const wishlistItems = await WishlistModel.getUserWishlist(userEmail);
        
        // Populate toy details
        const wishlistWithToys = await Promise.all(
            wishlistItems.map(async (item) => {
                const toy = await ToyModel.findById(item.toyId);
                return {
                    ...item,
                    toy: toy || null
                };
            })
        );

        return wishlistWithToys.filter(item => item.toy !== null);
    },

    checkPriceDrops: async (userEmail) => {
        const wishlistItems = await WishlistModel.getUserWishlist(userEmail);
        const notifications = [];

        for (const item of wishlistItems) {
            const toy = await ToyModel.findById(item.toyId);
            if (toy && toy.offerPrice && toy.price) {
                // Check if there's a price drop (simplified - you can add more logic)
                await NotificationModel.create({
                    userEmail,
                    type: 'price_drop',
                    title: 'Price Drop Alert',
                    message: `${toy.name} price dropped to ৳${toy.offerPrice}`,
                    toyId: toy._id.toString()
                });
            }
        }

        return notifications;
    }
};

module.exports = WishlistService;

