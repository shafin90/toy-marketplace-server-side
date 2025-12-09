const ToyModel = require('../models/ToyModel');

const CONDITION_MULTIPLIERS = {
    'new': 1.0,
    'like_new': 0.8,
    'good': 0.6,
    'fair': 0.4,
    'poor': 0.2
};

const CATEGORY_BASE_VALUES = {
    'cars': 50,
    'action_figures': 40,
    'dolls': 35,
    'educational': 45,
    'puzzles': 30,
    'board_games': 60,
    'outdoor': 55,
    'electronic': 80
};

const TradeInCalculatorService = {
    calculateValue: async (toyData) => {
        const {
            condition = 'good',
            category,
            subcategory,
            ageGroup,
            brand
        } = toyData;

        // Get base value from category
        const categoryKey = subcategory || category || 'cars';
        let baseValue = CATEGORY_BASE_VALUES[categoryKey] || 40;

        // Apply condition multiplier
        const conditionMultiplier = CONDITION_MULTIPLIERS[condition] || 0.6;
        let value = baseValue * conditionMultiplier;

        // Brand premium (if premium brand)
        const premiumBrands = ['lego', 'hasbro', 'mattel', 'fisher-price'];
        if (brand && premiumBrands.includes(brand.toLowerCase())) {
            value *= 1.2;
        }

        // Age group adjustment
        if (ageGroup === '13+') {
            value *= 1.1; // Older kids toys might be more valuable
        }

        // Round to nearest 5
        value = Math.round(value / 5) * 5;

        return {
            estimatedValue: Math.max(10, value), // Minimum 10 coins
            baseValue,
            conditionMultiplier,
            breakdown: {
                baseValue,
                condition: conditionMultiplier,
                finalValue: Math.max(10, value)
            }
        };
    },

    getConditionMultipliers: () => {
        return CONDITION_MULTIPLIERS;
    }
};

module.exports = TradeInCalculatorService;

