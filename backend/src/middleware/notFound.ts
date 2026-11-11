import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';

/**
 * Catch-all handler for undefined routes.
 * Creates a 404 AppError and forwards to the error handler.
 */
const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Not found – ${req.method} ${req.originalUrl}`, 404));
};

export default notFound;
