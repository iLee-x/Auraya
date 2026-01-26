import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError';
import { isDev } from '../config';

interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  stack?: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code,
    };

    if (isDev) {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  const response: ErrorResponse = {
    success: false,
    message: isDev ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
  };

  if (isDev) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

export default errorHandler;
