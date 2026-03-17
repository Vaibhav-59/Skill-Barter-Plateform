const express = require("express");
const { protect } = require("../middleware/auth");
const { body } = require("express-validator");
const { runValidation } = require("../middleware/validator");
const { upload } = require("../middleware/upload");
const User = require("../models/User");
const { cloudinaryDelete, extractPublicId } = require("../middleware/upload");
const {
  getProfile,
  updateProfile,
  searchUsers,
  getAllUsers,
  getDashboardStats,
  getUserById,
  deleteProfileImage,
} = require("../controllers/userController");

const router = express.Router();

// Get current logged-in user
router.get("/me", protect, async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
});

// Get Profile
router.get("/profile", protect, getProfile);

// Update Profile
router.put(
  "/profile",
  [
    protect,
    upload.fields([
      { name: "skillCertificates", maxCount: 10 },
      { name: "profileImage", maxCount: 1 },
      { name: "skillShowcaseVideo", maxCount: 1 }
    ]),
    body("name").optional().isString(),
    body("bio").optional().isString(),
    body("location").optional().isString(),
    body("role").optional().isString(),
    body("experienceLevel").optional().isString(),
    runValidation,
  ],
  updateProfile
);

// Delete Profile Image
router.delete("/profile-image", protect, deleteProfileImage);

// Get all users for discovery
router.get("/discover", protect, getAllUsers);

// Get dashboard stats
router.get("/dashboard-stats", protect, getDashboardStats);

// Delete a skill certificate
router.delete("/certificate/:index", protect, async (req, res, next) => {
  try {
    const { index } = req.params;
    const idx = parseInt(index, 10);
    const user = await User.findById(req.user._id);
    
    // Delete from new certificates array
    if (user.certificates && user.certificates[idx]) {
      const cert = user.certificates[idx];
      
      try {
        const publicId = extractPublicId(cert.fileUrl);
        if (publicId) {
          // PDFs/documents are stored as "raw" in Cloudinary
          const resourceType = cert.fileType === "image" ? "image" : "raw";
          await cloudinaryDelete(publicId, resourceType);
        }
      } catch (cloudErr) {
        console.error("Error deleting from Cloudinary:", cloudErr);
      }
      
      user.certificates.splice(idx, 1);
      await user.save();
    }
    // Fallback: also handle old skillCertificates format
    else if (user.skillCertificates && user.skillCertificates[idx]) {
      const certificateUrl = user.skillCertificates[idx];
      
      try {
        const publicId = extractPublicId(certificateUrl);
        if (publicId) {
          await cloudinaryDelete(publicId);
        }
      } catch (cloudErr) {
        console.error("Error deleting from Cloudinary:", cloudErr);
      }
      
      user.skillCertificates.splice(idx, 1);
      await user.save();
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Search Users
router.get("/search", protect, searchUsers);

// Get single user by ID
router.get("/:id", protect, getUserById); // ADDED

module.exports = router;
