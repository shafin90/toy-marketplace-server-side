const ReferralService = require('../services/ReferralService');

const ReferralController = {
    getReferralCode: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const code = await ReferralService.getReferralCode(userEmail);
            res.json({ referralCode: code });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    useReferralCode: async (req, res) => {
        try {
            const { refereeEmail } = req.user || { refereeEmail: req.body.refereeEmail };
            const { referralCode } = req.body;

            if (!refereeEmail || !referralCode) {
                return res.status(400).json({ message: 'User email and referral code are required' });
            }

            const referral = await ReferralService.useReferralCode(refereeEmail, referralCode);
            res.status(201).json({
                message: 'Referral code applied successfully',
                referral
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getUserReferrals: async (req, res) => {
        try {
            const { userEmail } = req.user || { userEmail: req.params.userEmail };

            if (!userEmail) {
                return res.status(400).json({ message: 'User email is required' });
            }

            const referrals = await ReferralService.getUserReferrals(userEmail);
            res.json(referrals);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = ReferralController;

