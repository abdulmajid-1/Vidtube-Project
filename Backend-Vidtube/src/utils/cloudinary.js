import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * Uploads a local file to Cloudinary and then deletes the local file
 * 
 * @param {string} localFilePath - Path to the local file to upload
 * @returns {Object|null} Cloudinary response object or null if upload fails
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // Return null if no file path provided
    if (!localFilePath) {
      return null;
    }

    // Upload file to Cloudinary with automatic resource type detection
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect if it's image, video, or other
    });

    console.log("File uploaded to Cloudinary. URL:", response.url);

    // Delete the local file after successful upload to save server space
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error("Failed to delete local file:", err);
      } else {
        console.log("Local file deleted successfully after upload.");
      }
    });

    return response;
  } catch (error) {
    // If upload fails, still try to delete the local file
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error("Failed to delete local file after upload error:", err);
      } else {
        console.log("Local file deleted after upload error.");
      }
    });
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

/**
 * Delete file from Cloudinary
 * Removes a file from Cloudinary using its public ID
 * 
 * @param {string} publicId - Public ID of the file to delete from Cloudinary
 * @returns {Object|null} Deletion result or null if deletion fails
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary. Public ID:", publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
