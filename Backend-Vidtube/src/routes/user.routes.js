import { Router } from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  isLoggedIn,
  getUserChannelProfile,
  updateAccoutDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

/**
 * User Routes Configuration
 * Defines all user-related API endpoints
 * Routes are organized by authentication requirements
 */

// Public Routes (No authentication required)
router.route("/register").post(
  // Handle file uploads for avatar and cover image during registration
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected Routes (Authentication required)
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/is-logged-in").get(isLoggedIn);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/update-account").patch(verifyJWT, updateAccoutDetails);

// File upload routes with authentication
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
