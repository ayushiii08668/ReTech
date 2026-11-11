import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

/**
 * Consistent API response shape.
 */
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  stack?: string;
}

/**
 * Handle Mongoose CastError (invalid ObjectId, etc.)
 */
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB duplicate key error (code 11000).
 */
const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] ?? 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose ValidationError.
 */
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Central error handling middleware.
 * Converts known error types to operational AppErrors.
 * Never leaks stack traces in production.
 */
const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    // Clone error and handle known MongoDB/Mongoose errors
    const anyErr = err as any;

    if (anyErr.name === 'CastError') {
      error = handleCastErrorDB(anyErr);
    } else if (anyErr.code === 11000) {
      error = handleDuplicateFieldsDB(anyErr);
    } else if (anyErr.name === 'ValidationError') {
      error = handleValidationErrorDB(anyErr);
    } else if (
      anyErr.name === 'MongoServerSelectionError' ||
      anyErr.name === 'MongooseServerSelectionError' ||
      (anyErr.name === 'MongooseError' && anyErr.message?.includes('buffering timed out')) ||
      anyErr.message?.includes('ECONNREFUSED') ||
      anyErr.message?.includes('connect EACCES')
    ) {
      error = new AppError('Database connection unavailable. Please start the local MongoDB service (net start MongoDB).', 503);
    } else {
      // Unknown / programming error
      error = new AppError(err.message || 'Internal Server Error', 500);
    }
  }

  logger.error(`${error.statusCode} - ${error.message}`);

  const response: ErrorResponse = {
    success: false,
    error: error.status,
    message: error.message,
  };

  // Include stack trace only in development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
