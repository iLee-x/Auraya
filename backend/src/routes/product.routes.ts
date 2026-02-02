import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';
import { uploadImages } from '../middlewares/upload';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  reorderImagesSchema,
} from '../validators/product.validator';

const router = Router();

// Public routes
router.get('/', validateQuery(productQuerySchema), productController.getAll);
router.get('/:idOrSlug', productController.getOne);

// Protected routes (Admin or Seller)
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'SELLER'),
  validate(createProductSchema),
  productController.create
);

router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'SELLER'),
  validate(updateProductSchema),
  productController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'SELLER'),
  productController.delete
);

// Image management routes
router.post(
  '/:id/images',
  authenticate,
  requireRole('ADMIN', 'SELLER'),
  uploadImages,
  productController.addImages
);

router.delete(
  '/:id/images/:imageId',
  authenticate,
  requireRole('ADMIN', 'SELLER'),
  productController.deleteImage
);

router.put(
  '/:id/images/reorder',
  authenticate,
  requireRole('ADMIN', 'SELLER'),
  validate(reorderImagesSchema),
  productController.reorderImages
);

export default router;
