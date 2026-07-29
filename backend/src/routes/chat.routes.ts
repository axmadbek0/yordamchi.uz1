import { Router } from 'express';
import { getUserChats, createChat, getChatMessages } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getUserChats);
router.post('/', authMiddleware, createChat);
router.get('/:chatId/messages', authMiddleware, getChatMessages);

export default router;
