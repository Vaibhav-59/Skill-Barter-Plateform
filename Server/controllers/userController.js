// /controllers/userController.js
const Match = require("../models/Match");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const { cloudinaryUpload, cloudinaryDelete, extractPublicId } = require("../middleware/upload");
const { aiCache } = require("../middleware/aiCache");

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, teachSkills, learnSkills, availability, location, role, experienceLevel } =
      req.body;

    console.log("Files received:", req.files ? req.files.length : 0);
    console.log("Body:", req.body);

    // location can arrive as a JSON string (multipart) or as an object
    let parsedLocation = location;
    if (typeof location === "string") {
      try { parsedLocation = JSON.parse(location); } catch { parsedLocation = { city: location, country: "" }; }
    }

    const updateData = {
      name,
      bio,
      teachSkills,
      learnSkills,
      availability: Array.isArray(availability) ? availability : (availability ? [availability] : []),
      location: parsedLocation || {},
      experienceLevel: experienceLevel || "",
    };

    if (role) {
      updateData.role = role;
    }

    if (req.files && req.files.length > 0) {
      const uploadedUrls = [];
      console.log("Uploading", req.files.length, "files");
      
      for (const file of req.files) {
        try {
          const result = await cloudinaryUpload(file.path, "SkillBarter/certificates");
          uploadedUrls.push(result.secure_url);
          console.log("Uploaded URL:", result.secure_url);
          
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting local file:", err);
          });
        } catch (uploadError) {
          console.error("Error uploading to Cloudinary:", uploadError);
        }
      }
      
      if (uploadedUrls.length > 0) {
        const existingUser = await User.findById(req.user._id);
        const existingCerts = existingUser && existingUser.skillCertificates ? existingUser.skillCertificates.filter(c => c) : [];
        const allCerts = [...existingCerts, ...uploadedUrls];
        updateData.skillCertificates = allCerts;
        console.log("Uploaded certificates:", uploadedUrls.length, "Total certificates:", allCerts.length);
      }
    } else {
      const existingUser = await User.findById(req.user._id);
      if (existingUser && existingUser.skillCertificates) {
        updateData.skillCertificates = existingUser.skillCertificates;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    await aiCache.invalidateUserCaches(req.user._id);

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Get all users for discovery
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name bio teachSkills learnSkills location role experienceLevel availability skillCertificates")
      .limit(50);

    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const user = req.user;

    const Match = require("../models/Match");
    const Review = require("../models/Review");

    const matches = await Match.countDocuments({
      $or: [{ requester: user._id }, { receiver: user._id }],
    });

    const pending = await Match.countDocuments({
      $or: [{ requester: user._id }, { receiver: user._id }],
      status: "pending",
    });

    const completed = await Match.countDocuments({
      $or: [{ requester: user._id }, { receiver: user._id }],
      status: { $in: ["accepted", "completed"] },
    });

    const skills =
      (user.teachSkills?.length || 0) + (user.learnSkills?.length || 0);

    const receivedReviews = await Review.countDocuments({
      reviewee: user._id,
    });

    res.json({
      matches,
      pending,
      completed,
      skills,
      receivedReviews,
    });
  } catch (err) {
    next(err);
  }
};

// Enhanced search with multiple filters
exports.searchUsers = async (req, res, next) => {
  try {
    const { keyword, category, location, availability, level } = req.query;
    const query = {};

    if (keyword) {
      query.$or = [
        { "teachSkills.name": { $regex: keyword, $options: "i" } },
        { "learnSkills.name": { $regex: keyword, $options: "i" } },
      ];
    }

    if (category) {
      query["teachSkills.category"] = category;
    }

    if (location) {
      query.$or = query.$or || [];
      query.$or.push(
        { "location.city": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } },
        // Fallback for old string location data
        { "location": { $regex: location, $options: "i" } }
      );
    }

    if (availability) {
      query.availability = { $in: [availability] };
    }

    if (level) {
      query["teachSkills.level"] = level;
    }

    const users = await User.find(query).select("-password");

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(new ErrorResponse(`Search failed: ${err.message}`, 500));
  }
};
