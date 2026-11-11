/**
 * Custom application error class.
 * Extends the native Error with HTTP status code and operational flag.
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Preserve proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
