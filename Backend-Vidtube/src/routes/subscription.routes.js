import { Router } from "express";

import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secured routes
router.route("/toggleSubscribe/:channelId").post(verifyJWT, toggleSubscription);

router.route("/c/:channelId").get(verifyJWT, getUserChannelSubscribers);

router.route("/u/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router;
