const express = require('express');
const {
  getReferralLink,
  getReferralStats,
  getReferralList,
  rewardCredits
} = require('../controllers/referralController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Secure routes

router.route('/link')
  .get(getReferralLink);

router.route('/stats')
  .get(getReferralStats);

router.route('/list')
  .get(getReferralList);

router.route('/reward')
  .post(rewardCredits);

module.exports = router;
