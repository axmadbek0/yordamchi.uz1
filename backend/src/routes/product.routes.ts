import { Router } from 'express';
import { getAllProducts, createProduct } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getAllProducts);
router.post('/', authenticate, authorize(['ADMIN']), createProduct);

export default router;
