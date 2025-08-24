import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
/**
 * Comment Schema
 * Defines the structure for video comments in the database
 * Includes content, video reference, and owner information
 */
const commentSchema = new Schema(
  {
    // Comment text content
    content: {
      type: String,
      required: true,
    },
    // Reference to the video this comment belongs to
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video", // References the Video model
    },
    // Reference to the user who created the comment
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the User model
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Add pagination plugin for efficient data retrieval
commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
