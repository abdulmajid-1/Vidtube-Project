import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const totalVideos = await Video.countDocuments({ owner: userId });
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });
  const totalViews = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);
  const totalLikes = await Like.countDocuments({
    video: { $in: await Video.find({ owner: userId }).distinct("_id") },
  });

  const stats = {
    totalVideos,
    totalSubscribers,
    totalViews: totalViews[0]?.totalViews || 0,
    totalLikes,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const videos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (page - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
    //  Join with User (owner info)
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    //  Join with Like model
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    //  Add totalLikes count
    {
      $addFields: {
        totalLikes: { $size: "$likes" },
      },
    },
    {
      $project: {
        likes: 0, // don't return full like docs, only count
      },
    },
  ]);

  const totalVideos = await Video.countDocuments({ owner: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / limit),
        totalVideos,
      },
      "Channel videos fetched successfully"
    )
  );
});

export { getChannelStats, getChannelVideos };
