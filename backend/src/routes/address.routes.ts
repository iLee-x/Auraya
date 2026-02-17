import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createAddressSchema,
  updateAddressSchema,
} from '../validators/address.validator';

const router = Router();

// All address routes require authentication
router.use(authenticate);

router.get('/', addressController.getAll);
router.get('/:id', addressController.getOne);
router.post('/', validate(createAddressSchema), addressController.create);
router.patch('/:id', validate(updateAddressSchema), addressController.update);
router.delete('/:id', addressController.remove);
router.patch('/:id/default', addressController.setDefault);

export default router;
