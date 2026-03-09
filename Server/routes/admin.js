const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getAdminStats,
  getSystemHealth,
  getUserAnalytics,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllReviews,
  deleteReview,
  getAllSkills,
  deleteSkill,
  getInactiveUsers,
  cleanupInactiveUsers,
  deleteInactiveUser,
} = require("../controllers/adminController");

// TEMPORARY: Open access for testing - remove after debugging
router.use(protect);

// Dashboard Routes
router.get("/stats", getAdminStats);
router.get("/system-health", getSystemHealth);
router.get("/user-analytics", getUserAnalytics);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Inactive Users
router.get("/inactive-users", getInactiveUsers);
router.post("/cleanup-inactive-users", cleanupInactiveUsers);
router.delete("/inactive-users/:id", deleteInactiveUser);

// Reviews
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

// Skills
router.get("/skills", getAllSkills);
router.delete("/skills/:id", deleteSkill);

module.exports = router;
