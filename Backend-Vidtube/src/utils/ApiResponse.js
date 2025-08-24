/**
 * Custom API Response class for standardized success responses
 * Provides consistent response format across all API endpoints
 */
class ApiResponse {
  /**
   * Create a new API Response instance
   * @param {number} statusCode - HTTP status code for the response
   * @param {any} data - Response data payload
   * @param {string} message - Success message (defaults to "Success")
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;  // HTTP status code
    this.data = data;             // Response data
    this.message = message;       // Success message
    this.success = statusCode < 400; // Automatically determine success based on status code
  }
}

export { ApiResponse };
