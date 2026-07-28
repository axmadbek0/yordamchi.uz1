import { Router } from 'express';
import { analyzeStatus, chatWithAi } from '../controllers/ai.controller';

const router = Router();

router.post('/analyze-status', analyzeStatus);
router.post('/chat', chatWithAi);

export default router;
