const express = require('express');
const router = express.Router();
const RecommendationController = require('../controllers/RecommendationController');

// Recommendation routes
router.get('/recommendations/age-based', RecommendationController.getAgeBasedRecommendations);
router.get('/recommendations/similar/:toyId', RecommendationController.getSimilarToys);
router.get('/recommendations/trending', RecommendationController.getTrendingToys);
router.get('/recommendations/personalized/:userEmail', RecommendationController.getPersonalizedRecommendations);

module.exports = router;

