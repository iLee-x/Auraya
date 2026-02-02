import { z } from 'zod';

const priceSchema = z
  .string()
  .or(z.number())
  .transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) {
      throw new Error('Invalid price');
    }
    return num;
  });

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: priceSchema,
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  categoryIds: z.array(z.string().cuid()).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  price: priceSchema.optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  categoryIds: z.array(z.string().cuid()).optional(),
});

export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || '1', 10);
      return num > 0 ? num : 1;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || '20', 10);
      return Math.min(Math.max(num, 1), 100);
    }),
  categorySlug: z.string().optional(),
  search: z.string().max(100).optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  sellerId: z.string().cuid().optional(),
  sortBy: z.enum(['createdAt', 'price', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string().cuid()).min(1, 'At least one image ID required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
