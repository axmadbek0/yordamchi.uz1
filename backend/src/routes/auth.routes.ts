import { Router } from 'express';
import { register, loginUser, googleAuth } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', loginUser);
router.post('/google', googleAuth);

export default router;
