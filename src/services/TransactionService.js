const TransactionModel = require('../models/TransactionModel');

const TransactionService = {
    getUserTransactions: async (email) => {
        return await TransactionModel.findByUser(email);
    },

    getCoinTransactions: async (email) => {
        return await TransactionModel.findByType(email, 'coin_earned');
    },

    getPurchaseHistory: async (email) => {
        return await TransactionModel.findByType(email, 'purchase');
    }
};

module.exports = TransactionService;

