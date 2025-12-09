const ShopFollowService = require('../services/ShopFollowService');

const ShopFollowController = {
    followShop: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { shopOwnerEmail } = req.body;

            if (!userEmail || !shopOwnerEmail) {
                return res.status(400).json({ message: 'User email and shop owner email are required' });
            }

            const follow = await ShopFollowService.followShop(userEmail, shopOwnerEmail);
            res.status(201).json(follow);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    unfollowShop: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.body.userEmail };
            const { shopOwnerEmail } = req.params;

            if (!userEmail || !shopOwnerEmail) {
                return res.status(400).json({ message: 'User email and shop owner email are required' });
            }

            await ShopFollowService.unfollowShop(userEmail, shopOwnerEmail);
            res.json({ message: 'Unfollowed shop' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    isFollowing: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.query.userEmail };
            const { shopOwnerEmail } = req.query;

            if (!userEmail || !shopOwnerEmail) {
                return res.status(400).json({ message: 'User email and shop owner email are required' });
            }

            const isFollowing = await ShopFollowService.isFollowing(userEmail, shopOwnerEmail);
            res.json({ isFollowing });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUserFollowing: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const following = await ShopFollowService.getUserFollowing(userEmail);
            res.json(following);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getShopFollowers: async (req, res) => {
        try {
            const { shopOwnerEmail } = req.params;

            if (!shopOwnerEmail) {
                return res.status(400).json({ message: 'Shop owner email is required' });
            }

            const followers = await ShopFollowService.getShopFollowers(shopOwnerEmail);
            res.json(followers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = ShopFollowController;

