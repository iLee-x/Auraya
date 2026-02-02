import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from '../validators/category.validator';

const router = Router();

// Public routes
router.get('/', validateQuery(categoryQuerySchema), categoryController.getAll);
router.get('/:idOrSlug', categoryController.getOne);

// Admin only routes
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createCategorySchema),
  categoryController.create
);

router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  categoryController.delete
);

export default router;
