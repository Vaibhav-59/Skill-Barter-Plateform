const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { runValidation } = require("../middleware/validator");
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  directResetPassword,
  sendLoginOtp,
  verifyLoginOtp,
} = require("../controllers/authController");
const rateLimit = require("express-rate-limit");
const { refreshToken } = require("../controllers/authController");

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// More relaxed limiter specifically for login OTP so it doesn't block during testing
const loginOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests, please try again later." },
});

// Refresh Token
router.post(
  "/refresh-token",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  runValidation,
  refreshToken
);

// Register
router.post(
  "/register",
  authLimiter,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  runValidation,
  register
);

// Login
router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  runValidation,
  login
);

// Logout
router.post("/logout", protect, logout);

// Forgot Password
router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().withMessage("Valid email is required")],
  runValidation,
  forgotPassword
);

// Reset Password
router.put(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  runValidation,
  resetPassword
);

// Direct Reset Password
router.post(
  "/direct-reset-password",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  runValidation,
  directResetPassword
);

// Send Login OTP
router.post(
  "/send-login-otp",
  loginOtpLimiter,
  [body("email").isEmail().withMessage("Valid email is required")],
  runValidation,
  sendLoginOtp
);

// Verify Login OTP
router.post(
  "/verify-login-otp",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("otp").notEmpty().withMessage("OTP is required"),
  ],
  runValidation,
  verifyLoginOtp
);

// DEBUG: Check current user role
router.get("/debug-me", protect, async (req, res) => {
  res.json({ 
    success: true, 
    user: { 
      id: req.user._id, 
      email: req.user.email, 
      role: req.user.role,
      name: req.user.name 
    } 
  });
});

// TEMPORARY: Make current user admin
router.get("/make-me-admin", protect, async (req, res, next) => {
  try {
    const User = require("../models/User");
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { role: "admin" },
      { new: true }
    );
    res.status(200).json({ 
      success: true, 
      message: "You are now an admin!",
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

// Remove admin role from user
router.get("/remove-my-admin", protect, async (req, res, next) => {
  try {
    const User = require("../models/User");
    await User.findByIdAndUpdate(req.user._id, { role: "user" });
    res.status(200).json({ success: true, message: "Admin role removed" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
