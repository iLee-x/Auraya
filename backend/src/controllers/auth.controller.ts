import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { config, isProd } from '../config';

const TOKEN_COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const setTokenCookie = (res: Response, token: string): void => {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
};

export const authController = {
  async register(
    req: Request<unknown, unknown, RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, token } = await authService.register(req.body);

      setTokenCookie(res, token);

      res.status(201).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, token } = await authService.login(req.body);

      setTokenCookie(res, token);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
