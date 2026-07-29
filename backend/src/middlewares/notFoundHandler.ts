import { Request, Response } from 'express';

/**
 * Catch-all 404 — barcha route'lardan keyin.
 * HTML emas, toza JSON qaytaradi.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Bunday API yo'li mavjud emas: ${req.method} ${req.originalUrl}`,
  });
}
