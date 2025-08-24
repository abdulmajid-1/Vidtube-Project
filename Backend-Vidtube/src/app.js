import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Initialize Express application
const app = express();

// Configure CORS for cross-origin requests
// Allows frontend to communicate with backend from different domains
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // Enable cookies and authentication headers
  })
);

// Global middleware configuration
// Parse JSON payloads with 16kb limit to prevent large payload attacks
app.use(express.json({ limit: "16kb" }));

// Parse URL-encoded bodies (form data) with extended mode
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from 'public' directory
app.use(express.static("public"));

// Parse cookies for authentication and session management
app.use(cookieParser());

// Import route modules for different API endpoints
import healthcheckRouter from "./routes/healthCheck.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// Import global error handling middleware
import { errorHandler } from "./middlewares/error.middlewares.js";

// API route configuration
// Mount different route modules to their respective endpoints
app.use("/api/v1/healthcheck", healthcheckRouter); // Health check endpoint
app.use("/api/v1/users", userRouter);              // User authentication and management
app.use("/api/v1/videos", videoRouter);            // Video CRUD operations
app.use("/api/v1/comments", commentRouter);        // Comment management
app.use("/api/v1/likes", likeRouter);              // Like/unlike functionality
app.use("/api/v1/playlists", playlistRouter);      // Playlist management
app.use("/api/v1/subscriptions", subscriptionRouter); // User subscriptions
app.use("/api/v1/tweets", tweetRouter);            // Social media tweets
app.use("/api/v1/dashboard", dashboardRouter);     // Dashboard analytics

// Global error handling middleware
// Must be last to catch all errors from previous middleware
app.use(errorHandler);

export { app };
