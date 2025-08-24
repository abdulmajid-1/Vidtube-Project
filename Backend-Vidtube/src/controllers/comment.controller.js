import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / parseInt(limit)),
        totalComments,
      },
      "Comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const owner = req.user._id; // always take from the logged-in user

  if (content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentID } = req.params;

  const comment = await Comment.findById(commentID);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own comments");
  }

  comment.content = content;
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentID } = req.params;

  const comment = await Comment.findById(commentID);

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  const isDeleted = await Comment.findByIdAndDelete(commentID);
  if (!isDeleted) {
    throw new ApiError(404, "Comment cannot be deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
