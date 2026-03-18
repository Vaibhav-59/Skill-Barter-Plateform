const crypto = require("crypto");
const User = require("../models/User");
const Referral = require("../models/Referral");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Notification = require("../models/Notification");

// @desc    Generate/Get Referral Link
// @route   GET /api/referral/link
// @access  Private
exports.getReferralLink = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Create unique short code if missing
  if (!user.referralCode) {
    const code = req.user.id.substring(req.user.id.length - 6).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();
    user.referralCode = code;
    await user.save();
  }

  // The link generated using the frontend domain
  const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;

  res.status(200).json({
    success: true,
    data: {
      referralCode: user.referralCode,
      referralLink: referralLink
    }
  });
});

// @desc    Get Referral Stats
// @route   GET /api/referral/stats
// @access  Private
exports.getReferralStats = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  const referrals = await Referral.find({ referrerId: user._id });
  
  let totalCreditsEarned = user.referralEarnings || 0;
  
  // Pending can be arbitrary log or we can derive it if 'Joined' implies more credits to be made
  const pendingRewards = referrals.filter(r => r.status === 'Joined').length * 10; 

  res.status(200).json({
    success: true,
    data: {
      totalInvited: referrals.length,
      creditsEarned: totalCreditsEarned,
      pendingRewards: pendingRewards
    }
  });
});

// @desc    Get Invited Users List
// @route   GET /api/referral/list
// @access  Private
exports.getReferralList = asyncHandler(async (req, res, next) => {
  const referrals = await Referral.find({ referrerId: req.user.id })
    .populate('referredUserId', 'name profileImage')
    .sort('-createdAt');

  const list = referrals.map(ref => ({
    _id: ref._id,
    username: ref.referredUserId ? ref.referredUserId.name : 'Unknown User',
    avatar: ref.referredUserId ? ref.referredUserId.profileImage : '',
    status: ref.status,
    creditsEarned: ref.creditsEarned,
    date: ref.createdAt
  }));

  res.status(200).json({
    success: true,
    data: list
  });
});

// @desc    Reward Credits (Test / Webhook / Internal execution)
// @route   POST /api/referral/reward
// @access  Private
exports.rewardCredits = asyncHandler(async (req, res, next) => {
  const { referralId, action } = req.body;
  // action enum: ['Completed Session', 'Completed Exchange']

  const referral = await Referral.findById(referralId);
  if (!referral) {
    return next(new ErrorResponse("Referral record not found", 404));
  }
  
  if (referral.referrerId.toString() !== req.user.id) {
    return next(new ErrorResponse("Not authorized to claim", 401));
  }

  let increment = 0;
  if (action === "Completed Session" && referral.status === "Joined") {
    referral.status = "Completed Session";
    increment = 10;
  } else if (action === "Completed Exchange" && referral.status !== "Completed Exchange") {
    referral.status = "Completed Exchange";
    increment = 15;
  } else {
    return res.status(200).json({ success: true, message: "Action already applied or invalid sequence" });
  }

  referral.creditsEarned += increment;
  await referral.save();

  // Give credits to user
  const user = await User.findById(req.user.id);
  user.referralEarnings = (user.referralEarnings || 0) + increment;
  user.timeCredits = (user.timeCredits || 0) + increment; 
  await user.save();

  // Integrated directly with Time Banking wallet
  try {
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: user._id });
    }
    wallet.earnedCredits += increment;
    await wallet.save();

    const referralUser = await User.findById(referral.referredUserId);

    await Transaction.create({
      userId: user._id,
      type: "bonus",
      skillName: "Referral Bonus",
      duration: 0,
      credits: increment,
      status: "completed",
      description: `Referral reward for ${referralUser ? referralUser.name : 'invitee'} - ${action}`,
      counterpartUser: referral.referredUserId
    });
  } catch (err) {
    console.error("Failed to add referral bonus to wallet:", err);
  }

  // Notify Referral Owner
  const referralUser = await User.findById(referral.referredUserId);
  await Notification.create({
    recipient: req.user.id,
    type: 'referral',
    content: `You earned ${increment} skill credits because ${referralUser ? referralUser.name : 'your invitee'} ${action === "Completed Session" ? "completed their first session" : "finished a skill exchange"}!`
  });

  res.status(200).json({
    success: true,
    message: `Rewarded ${increment} credits for ${action}`,
    data: {
      referralStatus: referral.status,
      newCreditsEarned: referral.creditsEarned
    }
  });
});

