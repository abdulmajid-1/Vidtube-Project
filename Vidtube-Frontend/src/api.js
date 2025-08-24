import axios from "axios";

/**
 * API Configuration
 * Creates an axios instance with base URL and request interceptors
 * Handles API URL rewriting and logging for debugging
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Base URL from environment variables
});

/**
 * Request Interceptor
 * Automatically rewrites URLs that start with "/api" to remove the prefix
 * Useful for consistent API calls across the application
 */
api.interceptors.request.use((config) => {
  // Remove "/api" prefix from URLs for cleaner API calls
  if (config.url.startsWith("/api")) {
    config.url = config.url.replace("/api", "");
  }
  
  // Log the final request URL for debugging purposes
  console.log("Final request URL:", config.baseURL + config.url);
  return config;
});

export default api;
