import { Router } from "express";

import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
  getAllTweets,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secured routes
router.route("/addTweet").post(verifyJWT, createTweet);

router.route("/getTweetsByID/:userId").get(verifyJWT, getUserTweets);

router.route("/getAllTweets").get(getAllTweets);

router.route("/updateTweet/:tweetId").patch(verifyJWT, updateTweet);

router.route("/deleteTweet/:tweetId").delete(verifyJWT, deleteTweet);

export default router;
