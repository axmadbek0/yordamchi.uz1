import { Router } from 'express';
import { getAllCategories, createCategory } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getAllCategories);
router.post('/', authenticate, authorize(['ADMIN']), createCategory);

export default router;
