import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

// Load environment variables from .env file
// This must be called before accessing any process.env variables
dotenv.config({
  path: "./.env",
});

// Set server port from environment variable or default to 8001
const PORT = process.env.PORT || 8001;

// Initialize database connection and start server
// This ensures database is ready before accepting requests
connectDB()
  .then(() => {
    // Start the Express server once database connection is established
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // Handle database connection errors
    console.log("MongoDB connection error:", err);
  });
