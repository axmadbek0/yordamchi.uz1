import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

/**
 * Authorization: Bearer <accessToken> ni tekshiradi
 * va decoded ma'lumotni req.user ga bog'laydi.
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Autentifikatsiya talab qilinadi');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw AppError.unauthorized('Autentifikatsiya talab qilinadi');
    }

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
      school_id: payload.school_id,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(AppError.unauthorized('Autentifikatsiya muvaffaqiyatsiz'));
  }
}

/** Alias — eski importlar uchun */
export const authMiddleware = authenticate;
