import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserChats = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.id;
    if (!user_id) return res.status(401).json({ message: 'Avtorizatsiyadan o`tmagan' });

    const chats = await prisma.chat.findMany({
      where: { user_id },
      include: {
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.id;
    const { type } = req.body; // AI or SUPPORT
    
    if (!user_id) return res.status(401).json({ message: 'Avtorizatsiyadan o`tmagan' });

    const chat = await prisma.chat.create({
      data: {
        user_id,
        type: type || 'AI'
      }
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const messages = await prisma.message.findMany({
      where: { chat_id: chatId },
      orderBy: { created_at: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
