import { NextFunction, Response } from 'express';
import { Role, AuthRequest } from '../types/auth.types';
import { AppError } from '../utils/AppError';

/**
 * RBAC: faqat ruxsat berilgan rollar o'tadi.
 * Misol: authorizeRoles('SUPER_ADMIN', 'TEACHER')
 */
export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('Autentifikatsiya talab qilinadi'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden('Ruxsat rad etildi'));
      return;
    }

    next();
  };
}
