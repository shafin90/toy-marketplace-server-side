const TransactionService = require('../services/TransactionService');

const TransactionController = {
    getUserTransactions: async (req, res) => {
        try {
            const transactions = await TransactionService.getUserTransactions(req.params.email);
            res.send(transactions);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    getCoinTransactions: async (req, res) => {
        try {
            const transactions = await TransactionService.getCoinTransactions(req.params.email);
            res.send(transactions);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    },

    getPurchaseHistory: async (req, res) => {
        try {
            const transactions = await TransactionService.getPurchaseHistory(req.params.email);
            res.send(transactions);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
};

module.exports = TransactionController;

