import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { error, log } from "console";

import jwt from "jsonwebtoken";
import { subscribe } from "diagnostics_channel";

/**
 * Generate access and refresh tokens for a user
 * @param {string} userId - The user's ID
 * @returns {Object} Object containing accessToken and refreshToken
 */
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(400, "User doesn't exist");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

/**
 * Register a new user
 * Handles user registration with avatar and cover image upload
 */
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Validate required fields
  if ([fullname, username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Handle file uploads for avatar and cover image
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let coverImage = "";
  if (coverLocalPath) {
    coverImage = await uploadOnCloudinary(coverLocalPath);
  }

  // Create new user in database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) throw new ApiError(500, "Something went wrong while registering user");

  // Generate authentication tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Configure cookie options for secure token storage
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken, refreshToken },
        "User registered & logged in successfully"
      )
    );
});

/**
 * Login user with email/username and password
 * Authenticates user and returns access tokens
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validate email is provided
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Find user by email or username
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log(isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate new tokens for login
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!loggedInUser) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Configure cookie options for cross-domain requests
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // Required for cross-domain requests
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

/**
 * Refresh access token using refresh token
 * Generates new access token when current one expires
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    // Verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while refreshing access token"
    );
  }
});

/**
 * Logout user by clearing tokens
 * Removes refresh token from database and clears cookies
 */
const logoutUser = asyncHandler(async (req, res) => {
  // Remove refresh token from database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  // Cookie options must match those used when setting the cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None", // Important for cross-site requests (Vercel frontend + Render backend)
  };

  // Clear authentication cookies
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * Change user's current password
 * Validates old password before allowing change
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/**
 * Get current logged-in user details
 * Returns user information without sensitive data
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user details"));
});

/**
 * Check if user is currently logged in
 * Returns authentication status and user info if authenticated
 */
const isLoggedIn = asyncHandler(async (req, res) => {
  try {
    // Check if user exists in request (set by auth middleware)
    if (!req.user) {
      return res
        .status(401)
        .json(
          new ApiResponse(401, { isLoggedIn: false }, "User not authenticated")
        );
    }

    // Return user information if logged in
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isLoggedIn: true,
          user: req.user,
        },
        "User is logged in"
      )
    );
  } catch (error) {
    return res
      .status(401)
      .json(
        new ApiResponse(401, { isLoggedIn: false }, "Authentication failed")
      );
  }
});

/**
 * Update user account details (fullname and email)
 * Allows users to modify their profile information
 */
const updateAccoutDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "fullname and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullname, email },
    },
    { new: true, select: "-password -refreshToken" }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { fullname: user.fullname, email: user.email },
        "Account details updated successfully"
      )
    );
});

/**
 * Update user avatar image
 * Uploads new avatar to Cloudinary and updates user profile
 */
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "File is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

/**
 * Update user cover image
 * Uploads new cover image to Cloudinary and updates user profile
 */
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiError(400, "File is required");
  }

  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!coverImage.url) {
    throw new ApiError(500, "Something went wrong while uploading cover Image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

/**
 * Get user channel profile with subscription statistics
 * Returns channel information including subscriber counts and subscription status
 */
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  // Aggregate pipeline to get channel profile with subscription data
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscriberedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscriberedTo",
        },
        // Check if current user is subscribed to this channel
        isSubscribed: {
          $in: [req.user?._id, "$subscribers.subscriber"],
        },
      },
    },
    {
      // Project only the necessary data for response
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        email: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    );
});

/**
 * Get user's watch history
 * Returns list of videos watched by the user with owner details
 */
const getWatchHistory = asyncHandler(async (req, res) => {
  // Aggregate pipeline to get watch history with video and owner details
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user?.length) {
    throw new ApiError(404, "watch history not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  isLoggedIn,
  updateAccoutDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
