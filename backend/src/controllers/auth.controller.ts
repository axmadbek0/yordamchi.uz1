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
}) {
  return {
    id: user.id,
    login: user.login,
    full_name: user.full_name,
    role: user.role as Role,
    school_id: user.school_id,
    phone: user.phone,
  };
}

async function issueTokens(user: {
  id: string;
  role: Role | string;
  school_id: string | null;
}) {
  const jti = crypto.randomUUID();

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role as Role,
    school_id: user.school_id,
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
 * Body: { login, password }
 * refreshToken — faqat httpOnly cookie orqali
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log('Kelyotgan ma\'lumot:', req.body);

    const { login: loginInput, password } = req.body as {
      login?: unknown;
      password?: unknown;
      role?: unknown;
      schoolNumber?: unknown;
    };

    // role / schoolNumber ixtiyoriy — e'tiborsiz qoldiriladi
    if (typeof loginInput !== 'string' || typeof password !== 'string') {
      throw AppError.badRequest('Login va parol kiritilishi shart');
    }

    if (loginInput.trim().length < 3 || password.length < 6) {
      throw AppError.badRequest('Login yoki parol noto\'g\'ri formatda');
    }

    const normalizedLogin = loginInput.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { login: normalizedLogin },
    });

    const passwordOk = await comparePassword(
      password,
      user?.password_hash ?? DUMMY_HASH
    );

    if (!user || !passwordOk) {
      throw AppError.unauthorized(INVALID_CREDENTIALS);
    }

    const tokens = await issueTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(200).json({
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      accessToken: tokens.accessToken,
      token: tokens.accessToken,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 * Cookie'dagi refreshToken orqali yangi accessToken beradi
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
      include: { user: true },
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
 * POST /api/auth/logout — cookie + DB dagi refresh tokenni bekor qilish
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
    res.json({ message: 'Tizimdan chiqdingiz' });
  } catch (error) {
    next(error);
  }
}
