import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
