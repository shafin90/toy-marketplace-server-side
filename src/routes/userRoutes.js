const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.post('/users', UserController.registerUser);
router.get('/users/:email', UserController.getUser);
router.put('/users/:email', UserController.updateProfile);
router.post('/users/:email/upgrade-shop', UserController.upgradeToShopOwner);

module.exports = router;
