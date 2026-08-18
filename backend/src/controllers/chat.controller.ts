import { Response, NextFunction } from 'express';
import { SenderType } from '../types/auth.types';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../types/auth.types';
import { AppError } from '../utils/AppError';

/**
 * GET /api/v1/chats — foydalanuvchining chatlari
 */
export async function getUserChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.id) {
      throw AppError.unauthorized('Avtorizatsiyadan o\'tmagan');
    }

    const chats = await prisma.chat.findMany({
      where: { user_id: req.user.id },
      include: {
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(chats);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/chats — yangi chat yaratish
 * Ixtiyoriy body: { content?: string } — birinchi xabar bilan birga
 */
export async function createChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.id) {
      throw AppError.unauthorized('Avtorizatsiyadan o\'tmagan');
    }

    const { content } = req.body as { content?: unknown };

    const chat = await prisma.chat.create({
      data: {
        user_id: req.user.id,
        ...(typeof content === 'string' && content.trim()
          ? {
              messages: {
                create: {
                  sender_type: SenderType.USER,
                  content: content.trim(),
                },
              },
            }
          : {}),
      },
      include: {
        messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/chats/:chatId/messages — chat xabarlari
 */
export async function getChatMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.id) {
      throw AppError.unauthorized('Avtorizatsiyadan o\'tmagan');
    }

    const { chatId } = req.params;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true, user_id: true },
    });

    if (!chat) {
      throw AppError.notFound('Chat topilmadi');
    }

    if (chat.user_id !== req.user.id) {
      throw AppError.forbidden('Ruxsat rad etildi');
    }

    const messages = await prisma.message.findMany({
      where: { chat_id: chatId },
      orderBy: { created_at: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
}
