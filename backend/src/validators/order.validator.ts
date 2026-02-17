import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.string().cuid('Invalid address ID'),
});

export const orderQuerySchema = z.object({
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
      const num = parseInt(val || '10', 10);
      return Math.min(Math.max(num, 1), 50);
    }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
