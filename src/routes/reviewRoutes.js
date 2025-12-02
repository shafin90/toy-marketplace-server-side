const express = require('express');
const ReviewController = require('../controllers/ReviewController');

const router = express.Router();

router.post('/reviews', ReviewController.createReview);
router.get('/reviews/toy/:toyId', ReviewController.getReviewsByToy);
router.get('/reviews/shop/:email', ReviewController.getReviewsByShopOwner);
router.put('/reviews/:id', ReviewController.updateReview);
router.delete('/reviews/:id', ReviewController.deleteReview);

module.exports = router;

