import multer from "multer";
import path from "path";

/**
 * Multer disk storage configuration
 * Handles file uploads to local storage before processing
 */
const storage = multer.diskStorage({
  /**
   * Set destination directory for uploaded files
   * Files are temporarily stored in public/temp before being processed
   */
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  
  /**
   * Generate unique filename for uploaded files
   * Prevents filename conflicts and maintains file extensions
   */
  filename: function (req, file, cb) {
    // Create unique suffix using timestamp and random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    
    // Combine unique suffix with original file extension
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

/**
 * Multer upload middleware
 * Configured with disk storage for handling file uploads
 * Used in routes that require file upload functionality
 */
export const upload = multer({ storage });
