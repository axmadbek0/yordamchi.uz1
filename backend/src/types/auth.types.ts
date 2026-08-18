import { Request } from 'express';

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const SenderType = {
  USER: 'USER',
  AI: 'AI',
  ADMIN: 'ADMIN',
} as const;

export type SenderType = (typeof SenderType)[keyof typeof SenderType];

export interface AuthUser {
  id: string;
  role: Role;
  school_id: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
