const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Joined', 'Completed Session', 'Completed Exchange'],
    default: 'Joined'
  },
  creditsEarned: {
    type: Number,
    default: 5
  }
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
