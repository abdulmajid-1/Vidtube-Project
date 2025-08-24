/**
 * Async Handler utility function
 * Wraps async route handlers to automatically catch errors and pass them to Express error middleware
 * Eliminates the need for try-catch blocks in every controller function
 * 
 * @param {Function} requestHandler - The async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // Wrap the async function in Promise.resolve to handle both async and sync functions
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
