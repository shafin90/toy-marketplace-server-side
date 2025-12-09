const ReferralModel = require('../models/ReferralModel');
const UserModel = require('../models/UserModel');
const NotificationService = require('./NotificationService');

const REFERRAL_REWARD = 50; // Coins for referrer
const REFEREE_REWARD = 25; // Coins for new user

const ReferralService = {
    getReferralCode: async (userEmail) => {
        return await ReferralModel.getUserReferralCode(userEmail);
    },

    useReferralCode: async (refereeEmail, referralCode) => {
        const referral = await ReferralModel.findByCode(referralCode);
        
        if (!referral) {
            throw new Error('Invalid referral code');
        }

        // Check if user already used a referral code
        const existing = await ReferralModel.findByReferee(refereeEmail);
        if (existing) {
            throw new Error('Referral code already used');
        }

        // Check if user is referring themselves
        if (referral.referrerEmail === refereeEmail) {
            throw new Error('Cannot use your own referral code');
        }

        // Create referral record
        const newReferral = await ReferralModel.create({
            referrerEmail: referral.referrerEmail,
            refereeEmail,
            referralCode
        });

        // Reward referrer
        await UserModel.updateCredits(referral.referrerEmail, REFERRAL_REWARD);
        
        // Reward referee
        await UserModel.updateCredits(refereeEmail, REFEREE_REWARD);

        // Notify both users
        await NotificationService.createNotification({
            userEmail: referral.referrerEmail,
            type: 'referral_reward',
            title: 'Referral Reward',
            message: `You earned ${REFERRAL_REWARD} coins for referring a friend!`
        });

        await NotificationService.createNotification({
            userEmail: refereeEmail,
            type: 'referral_reward',
            title: 'Welcome Bonus',
            message: `You earned ${REFEREE_REWARD} coins for using a referral code!`
        });

        return newReferral;
    },

    getUserReferrals: async (userEmail) => {
        return await ReferralModel.findByReferrer(userEmail);
    }
};

module.exports = ReferralService;

