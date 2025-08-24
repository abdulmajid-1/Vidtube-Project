import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Global Error Handling Middleware
 * Catches all errors thrown in the application and formats them consistently
 * Must be the last middleware in the chain
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError errors to ApiError format for consistency
  if (!(error instanceof ApiError)) {
    // Determine appropriate status code
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    const message = error.message || "Something went wrong";
    
    // Create new ApiError with proper formatting
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Prepare response object
  const response = {
    ...error,
    message: error.message,
    // Include stack trace only in development environment
    ...(process.env.NODE_ENV === "development"
      ? {
          stack: error.stack,
        }
      : {}),
  };

  // Send error response with appropriate status code
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
