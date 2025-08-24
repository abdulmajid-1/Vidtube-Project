import mongoose, { Schema } from "mongoose";

/**
 * Subscription Schema
 * Defines the structure for user subscriptions (following channels)
 * Represents a many-to-many relationship between users
 */
const subscriptionSchema = new Schema(
  {
    // User who is subscribing (the follower)
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the User model
    },
    // User being subscribed to (the channel owner)
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the User model
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
