import { Router } from 'express';
import { login, refreshToken, logout } from '../controllers/auth.controller';
import { register, me } from '../controllers/authController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, me);

router.post(
  '/register',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  register
);

export default router;
