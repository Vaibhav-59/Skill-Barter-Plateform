// /middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

// Middleware to protect routes (require login)
exports.protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, please login" });
  }

  try {
    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Middleware for admin-only access
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Please login first" });
  }
  
  if (req.user.role === "admin") {
    next();
  } else {
    console.log("Admin access denied for user:", req.user.email, "role:", req.user.role);
    return res.status(403).json({ success: false, message: "Access denied: Admin privileges required" });
  }
};

module.exports = { protect: exports.protect, adminOnly: exports.adminOnly };
