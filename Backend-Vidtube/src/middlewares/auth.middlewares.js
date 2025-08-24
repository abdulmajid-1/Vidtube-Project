import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * JWT Authentication Middleware
 * Verifies JWT token from cookies or Authorization header
 * Attaches authenticated user to request object
 * 
 * @param {Object} req - Express request object
 * @param {Object} _ - Express response object (unused)
 * @param {Function} next - Express next function
 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
  // Extract token from cookies or Authorization header
  // Priority: cookies first, then Authorization header
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // Check if token exists
  if (!token) {
    throw new ApiError(401, "Unauthorized - No access token provided");
  }

  try {
    // Verify the JWT token using the secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Find user by ID from decoded token, excluding sensitive fields
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken" // Exclude password and refresh token from response
    );

    // Check if user exists
    if (!user) {
      throw new ApiError(401, "Unauthorized - User not found");
    }

    // Attach user to request object for use in subsequent middleware/routes
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT verification errors (expired, invalid, etc.)
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
