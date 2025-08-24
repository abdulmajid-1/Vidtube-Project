import { Router } from "express";

import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secured routes
router.route("/createPlaylist").post(verifyJWT, createPlaylist);

router.route("/userPlaylist").get(verifyJWT, getUserPlaylists);

router.route("/getPlaylistById/:playlistId").get(verifyJWT, getPlaylistById);

router.route("/addVideoInPlaylist").post(verifyJWT, addVideoToPlaylist);

router
  .route("/removeVideoFromPlaylist")
  .delete(verifyJWT, removeVideoFromPlaylist);

router.route("/deletePlaylist/:playlistId").delete(verifyJWT, deletePlaylist);

router.route("/updatePlaylist/:playlistId").patch(verifyJWT, updatePlaylist);

export default router;
