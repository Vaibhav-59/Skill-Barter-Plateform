// /controllers/userController.js
const Match = require("../models/Match");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const { cloudinaryUploadCertificate, cloudinaryDelete, extractPublicId } = require("../middleware/upload");
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

    // ── Handle certificate uploads ──────────────────────────────────────
    // Fetch existing user to preserve old certificates
    const existingUser = await User.findById(req.user._id);
    const existingCerts = existingUser?.certificates || [];

    if (req.files && req.files.length > 0) {
      const newCerts = [];
      console.log("Uploading", req.files.length, "certificate files");

      for (const file of req.files) {
        try {
          // Determine file type for the certificate object
          let fileType = "document";
          if (file.mimetype?.startsWith("image/")) {
            fileType = "image";
          } else if (file.mimetype === "application/pdf") {
            fileType = "pdf";
          }

          // Upload using buffer (memoryStorage) — NOT file.path!
          const result = await cloudinaryUploadCertificate(
            file.buffer,
            file.originalname,
            file.mimetype
          );

          newCerts.push({
            fileUrl: result.secure_url,
            fileType,
            fileName: file.originalname || "certificate",
          });

          console.log("✅ Uploaded certificate:", result.secure_url, "type:", fileType);
        } catch (uploadError) {
          console.error("❌ Error uploading certificate to Cloudinary:", uploadError);
        }
      }

      // Merge: keep all existing certs + add new ones
      updateData.certificates = [...existingCerts, ...newCerts];
      console.log("Total certificates after upload:", updateData.certificates.length);
    } else {
      // No new files — preserve existing certificates
      updateData.certificates = existingCerts;
    }

    // Also migrate old skillCertificates (plain strings) into new format if they exist
    if (existingUser?.skillCertificates?.length > 0 && existingCerts.length === 0) {
      const migratedCerts = existingUser.skillCertificates
        .filter(url => url && typeof url === "string" && url.trim())
        .map(url => ({
          fileUrl: url,
          fileType: /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "image" : "pdf",
          fileName: url.split("/").pop() || "certificate",
        }));

      if (migratedCerts.length > 0) {
        updateData.certificates = [...migratedCerts, ...(updateData.certificates || [])];
        console.log("Migrated", migratedCerts.length, "old certificates to new format");
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
      .select("name bio teachSkills learnSkills location role experienceLevel availability skillCertificates certificates")
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
