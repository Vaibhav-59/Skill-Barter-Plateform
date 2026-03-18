// /controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail, sendOTPEmail, generateOTP } = require("../utils/sendEmail");
const { checkInactiveUsers } = require("../utils/inactiveUserHandler");
const Referral = require("../models/Referral");
const Notification = require("../models/Notification");
const ErrorResponse = require("../utils/errorResponse");

const validatePassword = (password) => {
  if (!password) return "Password is required";
  
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  
  if (!/^[A-Z]/.test(password)) {
    return "First character must be uppercase";
  }
  
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    return "Password must contain at least one symbol (@$!%*?&)";
  }
  
  return "";
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

// Add refresh token generation
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });
};

// Refresh token route handler
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ErrorResponse("Refresh token required", 400));
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findOne({ email });
    if (!user || user.refreshTokens && !user.refreshTokens.includes(refreshToken)) {
      return next(new ErrorResponse("Invalid refresh token", 401));
    }

    const newAccessToken = generateToken(user._id);

    res.json({
      success: true,
      token: newAccessToken,
    });
  } catch (err) {
    next(new ErrorResponse(`Token refresh failed: ${err.message}`, 401));
  }
};

// Register User
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password });

    // Handle referral if referralCode is provided
    const referralCode = req.body.referralCode;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        await user.save();

        // Create Referral record
        await Referral.create({
          referrerId: referrer._id,
          referredUserId: user._id,
          status: 'Joined',
          creditsEarned: 5
        });

        // Reward Referrer
        referrer.referralEarnings += 5;
        referrer.timeCredits += 5;
        await referrer.save();

        // Notify Referrer
        await Notification.create({
          recipient: referrer._id,
          type: 'referral',
          content: `${user.name} joined using your referral link! You earned 5 skill credits.`
        });
      }
    }

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    
    user.lastLogin = new Date();
    user.reminderSent = false;
    user.deletionNotificationSent = false;
    await user.save({ validateBeforeSave: false });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Reset your password here: ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      });
      res.json({ message: "Reset email sent" });
    } catch (error) {
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(error);
    }
  } catch (err) {
    next(err);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const tokenHash = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetToken: tokenHash,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token invalid or expired" });

    const passwordError = validatePassword(req.body.password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Direct Reset Password (without email)
exports.directResetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Send Login OTP
exports.sendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();

    user.loginOtp = otp;
    user.loginOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(user.email, otp, user.name);

    res.json({ message: "Login OTP sent to your email" });
  } catch (err) {
    next(err);
  }
};

// Verify Login OTP
exports.verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.loginOtp || !user.loginOtpExpire) {
      return res.status(400).json({ message: "No OTP requested. Please request an OTP first." });
    }

    if (user.loginOtpExpire < Date.now()) {
      user.loginOtp = undefined;
      user.loginOtpExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.loginOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.loginOtp = undefined;
    user.loginOtpExpire = undefined;
    user.lastLogin = new Date();
    user.reminderSent = false;
    user.deletionNotificationSent = false;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// Logout User
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.lastLogoutDate = new Date();
      
      const refreshToken = req.body.refreshToken;
      if (refreshToken && user.refreshTokens) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      }
      
      await user.save({ validateBeforeSave: false });
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};
