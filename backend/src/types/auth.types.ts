import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  role: Role;
  school_id: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
