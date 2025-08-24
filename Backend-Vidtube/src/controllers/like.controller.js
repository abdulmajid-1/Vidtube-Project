import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    // Unlike
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Video unliked successfully")
      );
  } else {
    // Like
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Something went wrong while liking video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: true }, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    // Unlike
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Comment unliked successfully")
      );
  } else {
    // Like
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Something went wrong while liking the comment");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: true }, "comment liked successfully")
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
  });

  console.log(existingLike);

  if (existingLike) {
    // Unlike
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "tweet unliked successfully")
      );
  } else {
    // Like
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Something went wrong while liking the tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: true }, "tweet liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: req.user._id,
        video: { $exists: true, $ne: null }, // only include video likes
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $replaceRoot: { newRoot: "$video" }, // flatten to just video fields
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  const totalLiked = await Like.countDocuments({
    likedBy: req.user._id,
    video: { $exists: true, $ne: null },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likedVideos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalLiked / parseInt(limit)),
        totalLikedVideos: totalLiked,
      },
      "Liked videos fetched successfully"
    )
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
