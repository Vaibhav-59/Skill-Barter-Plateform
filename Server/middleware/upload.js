const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudconfig");
const { Readable } = require("stream");

// ─── Multer: memory storage (no temp files written to disk) ──────────────────
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",   // .mov
  "video/x-msvideo",  // .avi
  "application/pdf",
  "application/msword",                                                        // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Accepted: jpg, png, gif, webp, mp4, mov, avi, pdf, doc, docx`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter,
});

// ─── Cloudinary upload via stream (works with memoryStorage buffer) ───────────
const cloudinaryUpload = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "SkillBarter/messages",
        resource_type: "auto",  // default — overridden by options.resource_type if provided
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Pipe buffer into the upload stream
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// ─── Cloudinary delete by public_id ──────────────────────────────────────────
const cloudinaryDelete = async (publicId, resourceType = "image") => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

module.exports = { upload, cloudinaryUpload, cloudinaryDelete };
