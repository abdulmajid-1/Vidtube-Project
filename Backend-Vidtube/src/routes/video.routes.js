import { Router } from "express";

import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideoLikes,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

/**
 * Video Routes Configuration
 * Defines all video-related API endpoints
 * Routes are organized by authentication requirements
 */

// Public Routes (No authentication required)
router.route("/getAll").get(getAllVideos);
router.route("/videos/:videoId/likes").get(getVideoLikes);

// Protected Routes (Authentication required)
router.route("/upload-video").post(
  verifyJWT,
  // Handle file uploads for video file and thumbnail
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router.route("/:videoId").get(verifyJWT, getVideoById);

// Video management routes
router
  .route("/updateVideo/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);

router.route("/:videoId/publish").patch(verifyJWT, togglePublishStatus);

export default router;
