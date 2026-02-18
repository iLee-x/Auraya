import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema, googleLoginSchema, updateProfileSchema } from '../validators/auth.validator';

const router = Router();

// POST /auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /auth/google
router.post('/google', validate(googleLoginSchema), authController.googleLogin);

// POST /auth/logout
router.post('/logout', authController.logout);

// GET /auth/me
router.get('/me', authenticate, authController.me);

// PATCH /auth/me
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);

export default router;
