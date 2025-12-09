const SustainabilityModel = require('../models/SustainabilityModel');

const SustainabilityService = {
    getUserStats: async (userEmail) => {
        return await SustainabilityModel.getUserStats(userEmail);
    },

    recordToySaved: async (userEmail, count = 1) => {
        return await SustainabilityModel.incrementToysSaved(userEmail, count);
    },

    recordToyExchanged: async (userEmail, count = 1) => {
        return await SustainabilityModel.incrementToysExchanged(userEmail, count);
    },

    recordToyPurchased: async (userEmail, count = 1) => {
        return await SustainabilityModel.incrementToysPurchased(userEmail, count);
    },

    getGlobalStats: async () => {
        return await SustainabilityModel.getGlobalStats();
    },

    formatImpact: (impactKg) => {
        if (impactKg >= 1000) {
            return `${(impactKg / 1000).toFixed(2)} tons CO2 saved`;
        }
        return `${impactKg.toFixed(2)} kg CO2 saved`;
    }
};

module.exports = SustainabilityService;

