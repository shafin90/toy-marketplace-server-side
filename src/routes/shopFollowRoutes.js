const express = require('express');
const router = express.Router();
const ShopFollowController = require('../controllers/ShopFollowController');

// Shop follow routes
router.post('/shop-follow', ShopFollowController.followShop);
router.delete('/shop-follow/:shopOwnerEmail', ShopFollowController.unfollowShop);
router.get('/shop-follow/check', ShopFollowController.isFollowing);
router.get('/shop-follow/:userEmail/following', ShopFollowController.getUserFollowing);
router.get('/shop-follow/:shopOwnerEmail/followers', ShopFollowController.getShopFollowers);

module.exports = router;

