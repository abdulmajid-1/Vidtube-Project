/**
 * Custom API Error class for standardized error handling
 * Extends the built-in Error class to provide consistent error responses
 */
class ApiError extends Error {
  /**
   * Create a new API Error instance
   * @param {number} statusCode - HTTP status code for the error
   * @param {string} message - Error message (defaults to "Something went wrong")
   * @param {Array} errors - Array of validation errors or additional error details
   * @param {string} stack - Error stack trace (optional)
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    // Call parent Error constructor
    super(message);
    
    // Set error properties for consistent API response format
    this.statusCode = statusCode;  // HTTP status code
    this.data = null;             // No data in error responses
    this.message = message;       // Error message
    this.success = false;         // Indicates failure
    this.errors = errors;         // Additional error details

    // Handle stack trace
    if (stack) {
      // Use provided stack trace
      this.stack = stack;
    } else {
      // Capture current stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
