import { Router } from 'express';
import { getAllCategories, createCategory } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', getAllCategories);
router.post('/', authMiddleware, authorizeRoles('SUPER_ADMIN'), createCategory);

export default router;
