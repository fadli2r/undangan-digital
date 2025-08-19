/**
 * Standardized API error handler
 * @param {Error} error - The error object
 * @param {import('next').NextApiResponse} res - Next.js API response object
 * @param {string} context - Context where the error occurred (for logging)
 */
export function handleApiError(error, res, context = 'API') {
  console.error(`${context} Error:`, error);

  // Database connection errors
  if (error.name === 'MongooseError' || error.name === 'MongoError') {
    return res.status(503).json({
      error: 'Database operation failed',
      details: error.message,
      code: 'DB_ERROR'
    });
  }

  // Timeout errors
  if (error.message?.includes('timed out') || error.message?.includes('ETIMEDOUT')) {
    return res.status(504).json({
      error: 'Request timed out',
      details: error.message,
      code: 'TIMEOUT'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(error.errors).map(err => err.message),
      code: 'VALIDATION_ERROR'
    });
  }

  // Authentication errors
  if (error.name === 'UnauthorizedError' || error.message?.includes('unauthorized')) {
    return res.status(401).json({
      error: 'Authentication required',
      details: error.message,
      code: 'AUTH_ERROR'
    });
  }

  // Permission errors
  if (error.name === 'ForbiddenError' || error.message?.includes('forbidden')) {
    return res.status(403).json({
      error: 'Permission denied',
      details: error.message,
      code: 'PERMISSION_ERROR'
    });
  }

  // Not found errors
  if (error.name === 'NotFoundError' || error.message?.includes('not found')) {
    return res.status(404).json({
      error: 'Resource not found',
      details: error.message,
      code: 'NOT_FOUND'
    });
  }

  // Duplicate key errors
  if (error.code === 11000 || error.name === 'MongoServerError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: error.message,
      code: 'DUPLICATE_ERROR'
    });
  }

  // Default error response
  return res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
    code: 'INTERNAL_ERROR'
  });
}

/**
 * Custom error classes for different types of API errors
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Wraps an API route handler with error handling
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with error handling
 */
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleApiError(error, res);
    }
  };
}

/**
 * Wraps an API route handler with error handling and authentication check
 * @param {Function} handler - The API route handler function
 * @param {Object} options - Options for the wrapper
 * @param {string[]} options.requiredPermissions - Required permissions for the route
 * @returns {Function} Wrapped handler with error handling and auth check
 */
export function withProtectedHandler(handler, options = {}) {
  return async (req, res) => {
    try {
      // Check authentication
      const { getSession } = await import('next-auth/react');
      const session = await getSession({ req });
      if (!session) {
        throw new UnauthorizedError();
      }

      // Check permissions if specified
      if (options.requiredPermissions?.length > 0) {
        const hasPermission = options.requiredPermissions.every(
          permission => session.user.permissions?.includes(permission)
        );
        if (!hasPermission) {
          throw new ForbiddenError('Insufficient permissions');
        }
      }

      await handler(req, res);
    } catch (error) {
      handleApiError(error, res);
    }
  };
}
