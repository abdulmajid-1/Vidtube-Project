import { Router } from "express";

import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secured routes
router.route("/toggle/v/:videoId").post(verifyJWT, toggleVideoLike);

router.route("/toggle/c/:commentId").post(verifyJWT, toggleCommentLike);

router.route("/toggle/t/:tweetId").post(verifyJWT, toggleTweetLike);

router.route("/videos").get(verifyJWT, getLikedVideos);

export default router;
