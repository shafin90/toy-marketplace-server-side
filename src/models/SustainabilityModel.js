const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'sustainability_stats';

const SustainabilityModel = {
    getUserStats: async (userEmail) => {
        let stats = await getCollection(collectionName).findOne({ userEmail });
        if (!stats) {
            // Initialize stats
            const newStats = {
                userEmail,
                toysSaved: 0,
                toysExchanged: 0,
                toysPurchased: 0,
                totalImpact: 0, // in kg CO2 saved
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await getCollection(collectionName).insertOne(newStats);
            stats = { ...newStats, _id: result.insertedId };
        }
        return stats;
    },

    incrementToysSaved: async (userEmail, count = 1) => {
        const stats = await SustainabilityModel.getUserStats(userEmail);
        const impact = count * 0.5; // 0.5 kg CO2 per toy saved
        return await getCollection(collectionName).updateOne(
            { userEmail },
            {
                $inc: {
                    toysSaved: count,
                    totalImpact: impact
                },
                $set: { updatedAt: new Date() }
            }
        );
    },

    incrementToysExchanged: async (userEmail, count = 1) => {
        const stats = await SustainabilityModel.getUserStats(userEmail);
        const impact = count * 0.3; // 0.3 kg CO2 per exchange
        return await getCollection(collectionName).updateOne(
            { userEmail },
            {
                $inc: {
                    toysExchanged: count,
                    totalImpact: impact
                },
                $set: { updatedAt: new Date() }
            }
        );
    },

    incrementToysPurchased: async (userEmail, count = 1) => {
        return await getCollection(collectionName).updateOne(
            { userEmail },
            {
                $inc: { toysPurchased: count },
                $set: { updatedAt: new Date() }
            }
        );
    },

    getGlobalStats: async () => {
        const stats = await getCollection(collectionName)
            .aggregate([
                {
                    $group: {
                        _id: null,
                        totalToysSaved: { $sum: '$toysSaved' },
                        totalToysExchanged: { $sum: '$toysExchanged' },
                        totalImpact: { $sum: '$totalImpact' },
                        totalUsers: { $sum: 1 }
                    }
                }
            ])
            .toArray();
        return stats[0] || {
            totalToysSaved: 0,
            totalToysExchanged: 0,
            totalImpact: 0,
            totalUsers: 0
        };
    }
};

module.exports = SustainabilityModel;

