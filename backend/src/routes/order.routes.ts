import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { validateQuery } from '../middlewares/validate';
import {
  checkoutSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post('/checkout', validate(checkoutSchema), orderController.checkout);
router.get('/', validateQuery(orderQuerySchema), orderController.getOrders);
router.get('/:id', orderController.getOrderById);

// Admin routes
router.get(
  '/admin/all',
  requireRole('ADMIN'),
  validateQuery(orderQuerySchema),
  orderController.getAllOrders
);
router.patch(
  '/admin/:id/status',
  requireRole('ADMIN'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);

export default router;
