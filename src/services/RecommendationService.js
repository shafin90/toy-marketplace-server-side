const ToyModel = require('../models/ToyModel');
const TransactionModel = require('../models/TransactionModel');
const RecentlyViewedModel = require('../models/RecentlyViewedModel');

const RecommendationService = {
    getAgeBasedRecommendations: async (age) => {
        // Age groups: 0-2, 3-5, 6-8, 9-12, 13+
        let ageGroup = '0-2';
        if (age >= 3 && age <= 5) ageGroup = '3-5';
        else if (age >= 6 && age <= 8) ageGroup = '6-8';
        else if (age >= 9 && age <= 12) ageGroup = '9-12';
        else if (age >= 13) ageGroup = '13+';

        const toys = await ToyModel.findAllAvailable();
        return toys.filter(toy => {
            const toyAgeGroup = toy.ageGroup || toy.age_group;
            return toyAgeGroup === ageGroup || toyAgeGroup?.includes(ageGroup);
        }).slice(0, 10);
    },

    getSimilarToys: async (toyId) => {
        const toy = await ToyModel.findById(toyId);
        if (!toy) return [];

        const toys = await ToyModel.findAllAvailable();
        return toys
            .filter(t => 
                t._id.toString() !== toyId &&
                (t.subcategory === toy.subcategory || 
                 t.sub_category === toy.sub_category ||
                 t.brand === toy.brand)
            )
            .slice(0, 6);
    },

    getTrendingToys: async () => {
        // Get toys sorted by view count or purchase count
        const toys = await ToyModel.findAllAvailable();
        return toys
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 10);
    },

    getPersonalizedRecommendations: async (userEmail) => {
        // Based on purchase history and recently viewed
        const purchases = await TransactionModel.findByUser(userEmail);
        const recentlyViewed = await RecentlyViewedModel.getUserRecentlyViewed(userEmail, 5);

        // Get categories from purchases
        const categories = new Set();
        purchases.forEach(p => {
            if (p.category) categories.add(p.category);
        });

        // Get toys from similar categories
        const toys = await ToyModel.findAllAvailable();
        return toys
            .filter(toy => {
                const toyCategory = toy.subcategory || toy.sub_category;
                return categories.has(toyCategory);
            })
            .slice(0, 10);
    }
};

module.exports = RecommendationService;

