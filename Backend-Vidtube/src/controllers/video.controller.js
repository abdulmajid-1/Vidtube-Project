import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * Get all published videos with pagination and filtering
 * Supports search, sorting, and user-specific filtering
 */
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const matchStage = { isPublished: true };

  // Add search functionality for title and description
  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Filter videos by specific user if userId provided
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // Configure sorting options
  const sortStage = {};
  if (sortBy && sortType) {
    sortStage[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sortStage.createdAt = -1; // Default sort by newest first
  }

  // Aggregate pipeline to get videos with related data
  const videos = await Video.aggregate([
    { $match: matchStage },

    // Join owner details from users collection
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    { $addFields: { owner: { $first: "$owner" } } },

    // Join likes data
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    // Join comments data
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    // Calculate total likes and comments count
    {
      $addFields: {
        totalLikes: { $size: "$likes" },
        totalcomments: { $size: "$comments" },
      },
    },

    // Remove arrays and keep only counts for performance
    { $project: { likes: 0, comments: 0 } },

    { $sort: sortStage },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ]);

  const totalVideos = await Video.countDocuments(matchStage);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / parseInt(limit)),
        totalVideos,
      },
      "Videos fetched successfully"
    )
  );
});

/**
 * Publish a new video
 * Handles video file and thumbnail upload to Cloudinary
 */
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // Upload video and thumbnail to Cloudinary
  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video) {
    throw new ApiError(400, "Error while uploading video");
  }

  if (!thumbnail) {
    throw new ApiError(400, "Error while uploading thumbnail");
  }

  // Create video document in database
  const videoDoc = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: Math.round(video.duration),
    owner: req.user._id,
  });

  const createdVideo = await Video.findById(videoDoc._id).populate(
    "owner",
    "fullName username avatar"
  );

  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while publishing video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo, "Video published successfully"));
});

/**
 * Get video by ID with owner details
 * Increments view count and adds to user's watch history
 */
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Aggregate pipeline to get video with owner details
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
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
  ]);

  if (!video?.length) {
    throw new ApiError(404, "Video not found");
  }

  // Increment view count for the video
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  // Add video to user's watch history
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchHistory: videoId },
  });
  const totalLikes = await Like.countDocuments({ video: videoId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video: video[0], totalLikes },
        "Video fetched successfully"
      )
    );
});

/**
 * Update video details and thumbnail
 * Allows video owners to modify title, description, and thumbnail
 */
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Ensure only video owner can update
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own videos");
  }

  const thumbnailLocalPath = req.file?.path;

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  // Handle thumbnail update if provided
  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (thumbnail) {
      updateFields.thumbnail = thumbnail.url;
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateFields,
    },
    { new: true }
  ).populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

/**
 * Delete video
 * Allows video owners to permanently remove their videos
 */
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Ensure only video owner can delete
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own videos");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

/**
 * Toggle video publish status
 * Allows video owners to make videos public or private
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Ensure only video owner can toggle publish status
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You can only toggle publish status of your own videos"
    );
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  ).populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video publish status toggled successfully"
      )
    );
});

/**
 * Get total likes for a video
 * Returns the count of likes for a specific video
 */
const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const totalLikes = await Like.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { totalLikes }, "Total likes fetched successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideoLikes,
};
