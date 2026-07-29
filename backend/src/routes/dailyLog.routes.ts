import { Router } from 'express';
import { createDailyLog } from '../controllers/dailyLogController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { validate } from '../middlewares/validate';
import { aiRateLimiter } from '../middlewares/rateLimiter';
import { createDailyLogSchema } from '../validations/dailyLog.validation';

const router = Router();

router.post(
  '/',
  aiRateLimiter,
  authMiddleware,
  authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  validate(createDailyLogSchema),
  createDailyLog
);

export default router;
