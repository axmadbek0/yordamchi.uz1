import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { authenticate } from './auth.middleware';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

export async function requireSchoolAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  authenticate(req, res, async (err) => {
    if (err) return next(err);
    if (!req.user) return next(AppError.unauthorized('Avtorizatsiyadan o\'tilmagan'));

    const role = req.user.role;
    if (role !== 'SCHOOL_ADMIN' && role !== 'SUPER_ADMIN') {
      return next(AppError.forbidden('Bu amalni bajarish huquqingiz yo\'q'));
    }

    if (!req.schoolId) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { school: true },
      });
      if (!user?.school_id) {
        return next(AppError.forbidden('Maktab ma\'lumotlari topilmadi'));
      }
      req.schoolId = user.school_id;
      req.schoolNumber = user.school?.number;
      req.user.school_id = user.school_id;
      req.user.school_number = user.school?.number;
    } else if (!req.schoolNumber) {
      const school = await prisma.school.findUnique({
        where: { id: req.schoolId },
      });
      if (school) {
        req.schoolNumber = school.number;
        req.user.school_number = school.number;
      }
    }

    next();
  });
}
