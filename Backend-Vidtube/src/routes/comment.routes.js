import { Router } from "express";

import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public routes
router.route("/getVideoComments/:videoId").get(getVideoComments);

// Secured routes
router.route("/addVideoComment/:videoId").post(verifyJWT, addComment);

router.route("/updateComment/:commentID").patch(verifyJWT, updateComment);

router.route("/deleteComment/:commentID").delete(verifyJWT, deleteComment);

export default router;
