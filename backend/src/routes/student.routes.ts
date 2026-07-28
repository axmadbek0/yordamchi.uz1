import { Router } from 'express';
import { getStudents, getStudentById } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getStudents);
router.get('/:id', getStudentById);

export default router;
