const { ObjectId } = require('mongodb');
const { getCollection } = require('../utils/db');

const collectionName = 'referrals';

const ReferralModel = {
    create: async (referral) => {
        const newReferral = {
            ...referral,
            referralCode: referral.referralCode || ReferralModel.generateCode(),
            rewardClaimed: false,
            createdAt: new Date()
        };
        const result = await getCollection(collectionName).insertOne(newReferral);
        return { ...newReferral, _id: result.insertedId };
    },

    generateCode: () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    },

    findByCode: async (code) => {
        return await getCollection(collectionName).findOne({ referralCode: code });
    },

    findByReferrer: async (referrerEmail) => {
        return await getCollection(collectionName)
            .find({ referrerEmail })
            .sort({ createdAt: -1 })
            .toArray();
    },

    findByReferee: async (refereeEmail) => {
        return await getCollection(collectionName).findOne({ refereeEmail });
    },

    claimReward: async (referralId) => {
        return await getCollection(collectionName).updateOne(
            { _id: new ObjectId(referralId) },
            { $set: { rewardClaimed: true, claimedAt: new Date() } }
        );
    },

    getUserReferralCode: async (userEmail) => {
        // Get or create referral code for user
        let referral = await getCollection(collectionName).findOne({ referrerEmail: userEmail });
        if (!referral) {
            const newReferral = {
                referrerEmail: userEmail,
                referralCode: ReferralModel.generateCode(),
                rewardClaimed: false,
                createdAt: new Date()
            };
            const result = await getCollection(collectionName).insertOne(newReferral);
            referral = { ...newReferral, _id: result.insertedId };
        }
        return referral.referralCode;
    }
};

module.exports = ReferralModel;

