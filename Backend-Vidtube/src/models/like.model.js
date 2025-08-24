import mongoose, { Schema } from "mongoose";

/**
 * Like Schema
 * Defines the structure for likes on videos, comments, and tweets
 * Supports polymorphic relationships (can like different types of content)
 */
const likeSchema = new Schema(
  {
    // Reference to the video being liked (optional)
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    // Reference to the comment being liked (optional)
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    // Reference to the tweet being liked (optional)
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    // Reference to the user who created the like
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the User model
    },
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

export const Like = mongoose.model("Like", likeSchema);
