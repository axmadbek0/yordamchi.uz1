import { Router } from 'express';
import { getAllProducts, createProduct } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', getAllProducts);
router.post('/', authMiddleware, authorizeRoles('SUPER_ADMIN'), createProduct);

export default router;
