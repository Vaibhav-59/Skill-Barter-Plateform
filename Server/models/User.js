// /models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    bio: {
      type: String,
      default: "",
    },

    refreshTokens: [{
      type: String,
      default: [],
    }],

    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", ""],
      default: "",
    },

    teachSkills: [
      new mongoose.Schema(
        {
          name: String,
          level: String,
        },
        { timestamps: true }
      ),
    ],

    learnSkills: [
      new mongoose.Schema(
        {
          name: String,
          level: String,
        },
        { timestamps: true }
      ),
    ],

    availability: [String],
    resetToken: String,
    resetTokenExpire: Date,
    loginOtp: String,
    loginOtpExpire: Date,
    role: {
      type: String,
      default: "user",
    },

    skillCertificates: [{
      type: String,
      default: "",
    }],
    certificates: [{
      fileUrl:  { type: String, required: true },
      fileType: { type: String, enum: ["image", "pdf", "document"], default: "image" },
      fileName: { type: String, default: "" },
    }],
    lastLogoutDate: {
      type: Date,
      default: null,
    },
    inactiveDaysCount: {
      type: Number,
      default: 0,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    deletionNotificationSent: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
    skillShowcaseVideo: {
      type: String,
      default: "",
    },
    learningStyle: {
      type: String,
      enum: ["Visual", "Auditory", "Reading/Writing", "Hands-on", "Interactive", ""],
      default: "",
    },
    teachingStyle: {
      type: String,
      enum: ["Hands-on", "Lecture-based", "Project-based", "Step-by-step guidance", "Discussion-based", ""],
      default: "",
    },
    linkedinUrl: { type: String, default: "" },
    twitterUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    languages: {
      type: [String],
      default: [],
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
