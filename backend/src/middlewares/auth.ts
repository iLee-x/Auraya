import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const TOKEN_COOKIE_NAME = 'token';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token =
      req.cookies[TOKEN_COOKIE_NAME] ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw AppError.unauthorized('Authentication required', 'NO_TOKEN');
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(AppError.unauthorized('Invalid or expired token', 'INVALID_TOKEN'));
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required', 'NO_TOKEN'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden('Insufficient permissions', 'INSUFFICIENT_ROLE'));
      return;
    }

    next();
  };
};

export default authenticate;
