import { Router } from 'express';
import { analyzeStatus, chatWithAiHandler } from '../controllers/ai.controller';
import { aiRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/analyze-status', aiRateLimiter, analyzeStatus);
router.post('/chat', aiRateLimiter, chatWithAiHandler);

export default router;
