import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Playlist name is required");
  }

  if (!description || description.trim() === "") {
    throw new ApiError(400, "Playlist description is required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: req.user._id,
  });

  const createdPlaylist = await Playlist.findById(playlist._id).populate(
    "owner",
    "fullName username avatar"
  );

  if (!createdPlaylist) {
    throw new ApiError(500, "Something went wrong while creating playlist");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const playlists = await Playlist.find({ owner: userId })
    .populate("owner", "fullName username avatar")
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  const totalPlaylists = await Playlist.countDocuments({ owner: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlists,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPlaylists / parseInt(limit)),
        totalPlaylists,
      },
      "User playlists fetched successfully"
    )
  );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
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
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
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

  if (!playlist?.length) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only add videos to your own playlists");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  ).populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You can only remove videos from your own playlists"
    );
  }

  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video does not exist in playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  ).populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own playlists");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  if (!name && !description) {
    throw new ApiError(
      400,
      "At least one field (name or description) is required"
    );
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own playlists");
  }

  const updateFields = {};
  if (name) updateFields.name = name.trim();
  if (description) updateFields.description = description.trim();

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: updateFields,
    },
    { new: true }
  ).populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
