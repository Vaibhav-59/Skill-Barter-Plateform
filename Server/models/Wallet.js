const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalCredits: {
      type: Number,
      default: 5, // welcome bonus
    },
    earnedCredits: {
      type: Number,
      default: 5,
    },
    spentCredits: {
      type: Number,
      default: 0,
    },
    // Current available balance (totalCredits - spentCredits + earnedCredits)
    balance: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

// Virtual for computing balance on save
walletSchema.pre("save", function (next) {
  this.balance = this.earnedCredits - this.spentCredits;
  this.totalCredits = this.earnedCredits + this.spentCredits;
  next();
});

module.exports = mongoose.model("Wallet", walletSchema);
