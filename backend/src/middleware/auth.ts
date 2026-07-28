import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    school_id?: string | null;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Kirish taqiqlangan. Token mavjud emas.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('FATAL ERROR: JWT_SECRET is not set.');
      return res.status(500).json({ message: 'Server konfiguratsiya xatosi.' });
    }
    const decoded = jwt.verify(token, secret) as { id: string; role: string; school_id?: string | null };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Yaroqsiz token.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sizga bu ruxsat berilmagan.' });
    }
    next();
  };
};
