const TradeInCalculatorService = require('../services/TradeInCalculatorService');

const TradeInCalculatorController = {
    calculateValue: async (req, res) => {
        try {
            const toyData = req.body;

            if (!toyData.condition) {
                return res.status(400).json({ message: 'Toy condition is required' });
            }

            const calculation = await TradeInCalculatorService.calculateValue(toyData);
            res.json(calculation);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getConditionMultipliers: async (req, res) => {
        try {
            const multipliers = TradeInCalculatorService.getConditionMultipliers();
            res.json(multipliers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = TradeInCalculatorController;

