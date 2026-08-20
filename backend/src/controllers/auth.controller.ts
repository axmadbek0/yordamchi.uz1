import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Role } from '../types/auth.types';
import { prisma } from '../lib/prisma';
import { comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import {
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/cookies';

const INVALID_CREDENTIALS = 'Login yoki parol noto\'g\'ri';

const DUMMY_HASH =
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getRefreshExpiryDate(): Date {
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const match = /^(\d+)d$/.exec(raw);
  const days = match ? Number(match[1]) : 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

function toPublicUser(user: {
  id: string;
  login: string;
  full_name: string | null;
  role: Role | string;
  school_id: string | null;
  phone: string | null;
  must_change_password?: boolean;
  school?: { number: number; name: string } | null;
}) {
  return {
    id: user.id,
    login: user.login,
    full_name: user.full_name,
    displayName: user.full_name || user.login,
    role: user.role as Role,
    school_id: user.school_id,
    schoolId: user.school_id,
    schoolNumber: user.school?.number ?? undefined,
    phone: user.phone,
    mustChangePassword: user.must_change_password ?? false,
  };
}

async function issueTokens(user: {
  id: string;
  role: Role | string;
  school_id: string | null;
  school?: { number: number } | null;
}) {
  const jti = crypto.randomUUID();

  let schoolNumber: number | null = user.school?.number ?? null;
  if (!schoolNumber && user.school_id) {
    const s = await prisma.school.findUnique({ where: { id: user.school_id } });
    if (s) schoolNumber = s.number;
  }

  const accessToken = signAccessToken({
    sub: user.id,
    userId: user.id,
    role: user.role as Role,
    school_id: user.school_id,
    schoolId: user.school_id ?? undefined,
    school_number: schoolNumber,
    schoolNumber: schoolNumber ?? undefined,
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    jti,
  });

  await prisma.refreshToken.create({
    data: {
      token_hash: sha256(refreshToken),
      user_id: user.id,
      expires_at: getRefreshExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/login
 * Body: { login, password, role?, schoolNumber? }
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      login: loginInput,
      password,
      role: roleInput,
      schoolNumber: schoolNumInput,
    } = req.body as {
      login?: unknown;
      password?: unknown;
      role?: unknown;
      schoolNumber?: unknown;
    };

    if (typeof loginInput !== 'string' || typeof password !== 'string') {
      throw AppError.badRequest('Login va parol kiritilishi shart');
    }

    if (loginInput.trim().length < 3 || password.length < 5) {
      throw AppError.unauthorized(INVALID_CREDENTIALS);
    }

    const normalizedLogin = loginInput.trim().toLowerCase();

    // Check if role is school_admin or SCHOOL_ADMIN
    const isSchoolAdminReq =
      typeof roleInput === 'string' &&
      (roleInput.toLowerCase() === 'school_admin' || roleInput.toUpperCase() === 'SCHOOL_ADMIN');

    let user = await prisma.user.findUnique({
      where: { login: normalizedLogin },
      include: { school: true },
    });

    // If school number is supplied, ensure user's school matches
    if (user && schoolNumInput) {
      const parsedNum = Number(schoolNumInput);
      if (!isNaN(parsedNum) && user.school && user.school.number !== parsedNum) {
        // Mismatch between school and user
        await comparePassword(password, DUMMY_HASH);
        throw AppError.unauthorized(INVALID_CREDENTIALS);
      }
    }

    const passwordOk = await comparePassword(
      password,
      user?.password_hash ?? DUMMY_HASH
    );

    if (!user || !passwordOk) {
      throw AppError.unauthorized(INVALID_CREDENTIALS);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const tokens = await issueTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      accessToken: tokens.accessToken,
      token: tokens.accessToken,
      user: toPublicUser(user),
      mustChangePassword: user.must_change_password,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];

    if (typeof tokenFromCookie !== 'string' || !tokenFromCookie.trim()) {
      throw AppError.unauthorized('Autentifikatsiya muvaffaqiyatsiz');
    }

    const payload = verifyRefreshToken(tokenFromCookie);
    const tokenHash = sha256(tokenFromCookie);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
      include: { user: { include: { school: true } } },
    });

    if (
      !storedToken ||
      storedToken.revoked_at ||
      storedToken.expires_at < new Date() ||
      storedToken.user_id !== payload.sub
    ) {
      clearRefreshTokenCookie(res);
      throw AppError.unauthorized('Autentifikatsiya muvaffaqiyatsiz');
    }

    // Rotation: eski token bekor qilinadi
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked_at: new Date() },
    });

    const tokens = await issueTokens(storedToken.user);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      token: tokens.accessToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    clearRefreshTokenCookie(res);
    next(AppError.unauthorized('Autentifikatsiya muvaffaqiyatsiz'));
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];

    if (typeof tokenFromCookie === 'string' && tokenFromCookie.trim()) {
      await prisma.refreshToken.updateMany({
        where: {
          token_hash: sha256(tokenFromCookie),
          revoked_at: null,
        },
        data: { revoked_at: new Date() },
      });
    }

    clearRefreshTokenCookie(res);
    res.json({ success: true, message: 'Tizimdan chiqdingiz' });
  } catch (error) {
    next(error);
  }
}
