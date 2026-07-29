import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  school_id: string | null;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  // .env dagi qo'shtirnoqlarni tozalash
  return value.trim().replace(/^["']|["']$/g, '');
}

/**
 * Server startida chaqiriladi.
 * Kalitlar yo'q bo'lsa — aniq xabar + process.exit(1).
 */
export function assertJwtSecrets(): void {
  const access = readEnv('JWT_ACCESS_SECRET') || readEnv('JWT_SECRET');
  const refresh = readEnv('JWT_REFRESH_SECRET');

  const missing: string[] = [];
  if (!access) missing.push('JWT_ACCESS_SECRET');
  if (!refresh) missing.push('JWT_REFRESH_SECRET');

  if (missing.length > 0) {
    console.error('================================================');
    console.error('[FATAL] JWT secret kalitlari sozlanmagan!');
    console.error(`Yetishmayotgan: ${missing.join(', ')}`);
    console.error('backend/.env fayliga quyidagilarni qo\'shing:');
    console.error('  JWT_ACCESS_SECRET=uzun_random_string');
    console.error('  JWT_REFRESH_SECRET=boshqa_uzun_random_string');
    console.error('================================================');
    process.exit(1);
  }
}

function getAccessSecret(): string {
  const secret = readEnv('JWT_ACCESS_SECRET') || readEnv('JWT_SECRET');
  if (!secret) {
    console.error('[FATAL] JWT_ACCESS_SECRET sozlanmagan');
    process.exit(1);
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = readEnv('JWT_REFRESH_SECRET');
  if (!secret) {
    console.error('[FATAL] JWT_REFRESH_SECRET sozlanmagan');
    process.exit(1);
  }
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getAccessSecret(), options);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getRefreshSecret(), options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getAccessSecret()) as JwtPayload & AccessTokenPayload;
  return {
    sub: decoded.sub,
    role: decoded.role,
    school_id: decoded.school_id ?? null,
  };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, getRefreshSecret()) as JwtPayload & RefreshTokenPayload;
  return {
    sub: decoded.sub,
    jti: decoded.jti,
  };
}
