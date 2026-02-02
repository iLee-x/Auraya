import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  parentId: z.string().cuid().optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
});

export const categoryQuerySchema = z.object({
  flat: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  parentId: z.string().cuid().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
