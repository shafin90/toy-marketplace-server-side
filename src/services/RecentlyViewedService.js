const RecentlyViewedModel = require('../models/RecentlyViewedModel');
const ToyModel = require('../models/ToyModel');

const RecentlyViewedService = {
    addView: async (userEmail, toyId) => {
        return await RecentlyViewedModel.addView(userEmail, toyId);
    },

    getUserRecentlyViewed: async (userEmail, limit = 10) => {
        const views = await RecentlyViewedModel.getUserRecentlyViewed(userEmail, limit);
        
        // Populate toy details
        const viewsWithToys = await Promise.all(
            views.map(async (view) => {
                const toy = await ToyModel.findById(view.toyId);
                return {
                    ...view,
                    toy: toy || null
                };
            })
        );

        return viewsWithToys.filter(view => view.toy !== null);
    },

    clearHistory: async (userEmail) => {
        return await RecentlyViewedModel.clearHistory(userEmail);
    }
};

module.exports = RecentlyViewedService;

