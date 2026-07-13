class AppError extends Error {
  /**
   * Custom Application Error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Indicates this is a predictable, handled error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
