import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../types/auth.types';
import { hashPassword } from '../utils/hash';
import { AppError } from '../utils/AppError';

export { login, refreshToken, logout } from './auth.controller';

const SCHOOL_BOUND_ROLES: Role[] = ['SCHOOL_ADMIN', 'TEACHER', 'PARENT'];

function sanitizeUser(user: {
  id: string;
  login: string;
  full_name: string | null;
  role: Role;
  school_id: string | null;
  phone: string | null;
}) {
  return {
    id: user.id,
    login: user.login,
    full_name: user.full_name,
    role: user.role,
    school_id: user.school_id,
    phone: user.phone,
  };
}

function assertRole(role: unknown): role is Role {
  return (
    typeof role === 'string' &&
    ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT'].includes(role)
  );
}

function validateCredentialsInput(loginVal: unknown, password: unknown): void {
  if (typeof loginVal !== 'string' || loginVal.trim().length < 3) {
    throw AppError.badRequest('Noto\'g\'ri so\'rov');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw AppError.badRequest('Noto\'g\'ri so\'rov');
  }
}

function validateRegisterInput(body: {
  login?: unknown;
  password?: unknown;
  role?: unknown;
  full_name?: unknown;
  phone?: unknown;
  school_id?: unknown;
}): void {
  validateCredentialsInput(body.login, body.password);

  if (!assertRole(body.role)) {
    throw AppError.badRequest('Noto\'g\'ri so\'rov');
  }

  if (body.full_name !== undefined && typeof body.full_name !== 'string') {
    throw AppError.badRequest('Noto\'g\'ri so\'rov');
  }

  if (body.phone !== undefined && typeof body.phone !== 'string') {
    throw AppError.badRequest('Noto\'g\'ri so\'rov');
  }

  if (
    body.school_id !== undefined &&
    body.school_id !== null &&
    typeof body.school_id !== 'string'
  ) {
    throw AppError.badRequest('Noto\'g\'ri so\'rov');
  }
}

async function resolveSchoolIdForRegistration(
  actor: NonNullable<AuthRequest['user']>,
  targetRole: Role,
  requestedSchoolId?: string | null
): Promise<string | null> {
  if (targetRole === 'SUPER_ADMIN') {
    return null;
  }

  if (SCHOOL_BOUND_ROLES.includes(targetRole)) {
    if (!requestedSchoolId) {
      throw AppError.badRequest('Noto\'g\'ri so\'rov');
    }

    const school = await prisma.school.findUnique({ where: { id: requestedSchoolId } });
    if (!school) {
      throw AppError.badRequest('Noto\'g\'ri so\'rov');
    }

    if (actor.role === 'SCHOOL_ADMIN' && actor.school_id !== requestedSchoolId) {
      throw AppError.forbidden();
    }

    return requestedSchoolId;
  }

  return requestedSchoolId ?? null;
}

function assertCanCreateRole(actorRole: Role, targetRole: Role): void {
  if (actorRole === 'SUPER_ADMIN') return;

  if (actorRole === 'SCHOOL_ADMIN') {
    if (targetRole === 'TEACHER' || targetRole === 'PARENT') return;
    throw AppError.forbidden();
  }

  throw AppError.forbidden();
}

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const { login: loginInput, password, role, full_name, phone, school_id } = req.body;
    validateRegisterInput({ login: loginInput, password, role, full_name, phone, school_id });

    const targetRole = role as Role;
    assertCanCreateRole(req.user.role, targetRole);

    const resolvedSchoolId = await resolveSchoolIdForRegistration(
      req.user,
      targetRole,
      school_id
    );

    const normalizedLogin = (loginInput as string).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { login: normalizedLogin } });
    if (existingUser) {
      throw AppError.conflict('Bu login band');
    }

    const password_hash = await hashPassword(password as string);

    const user = await prisma.user.create({
      data: {
        login: normalizedLogin,
        password_hash,
        role: targetRole,
        full_name: typeof full_name === 'string' ? full_name.trim() : null,
        phone: typeof phone === 'string' ? phone.trim() : null,
        school_id: resolvedSchoolId,
      },
    });

    res.status(201).json({
      message: 'Foydalanuvchi muvaffaqiyatli yaratildi',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      throw AppError.unauthorized('Autentifikatsiya muvaffaqiyatsiz');
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}
