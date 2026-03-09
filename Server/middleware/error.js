// /middleware/error.js
const ErrorResponse = require("../utils/errorResponse");

// Custom error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let error = { ...err };
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorResponse(message, 404);
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Handle Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message).join(", ");
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : null,
  });
};

module.exports = errorHandler;
