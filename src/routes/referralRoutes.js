const express = require('express');
const router = express.Router();
const ReferralController = require('../controllers/ReferralController');

// Referral routes
router.get('/referral/:userEmail/code', ReferralController.getReferralCode);
router.post('/referral/use', ReferralController.useReferralCode);
router.get('/referral/:userEmail/referrals', ReferralController.getUserReferrals);

module.exports = router;

