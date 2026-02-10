import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../validators/cart.validator';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);

router.post('/items', validate(addToCartSchema), cartController.addItem);

router.patch(
  '/items/:itemId',
  validate(updateCartItemSchema),
  cartController.updateItem
);

router.delete('/items/:itemId', cartController.removeItem);

router.delete('/', cartController.clearCart);

export default router;
