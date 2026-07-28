import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

export const register = async (req: Request, res: Response) => {
  try {
    const { login, password, full_name, role, school_id } = req.body;

    // Input Validation
    if (!login || typeof login !== 'string' || login.length < 3) {
      return res.status(400).json({ message: 'Login kamida 3 ta belgidan iborat bo`lishi kerak' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Parol kamida 6 ta belgidan iborat bo`lishi kerak' });
    }
    if (!role || !['ADMIN', 'TEACHER', 'PARENT'].includes(role)) {
      return res.status(400).json({ message: 'Noto`g`ri rol ko`rsatildi' });
    }

    const existingUser = await prisma.user.findUnique({ where: { login } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ushbu login band qilingan' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        login,
        password_hash,
        full_name,
        role: role as Role,
        school_id
      },
    });

    res.status(201).json({ message: 'Ro`yxatdan muvaffaqiyatli o`tdingiz', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { login, password, role } = req.body;

    if (!login || typeof login !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Login va parol kiritilishi shart' });
    }

    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) {
      return res.status(400).json({ message: 'Login yoki parol noto`g`ri' });
    }

    // Role check if needed
    if (role && user.role !== role && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Siz ushbu rolga ega emassiz' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Login yoki parol noto`g`ri' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('FATAL ERROR: JWT_SECRET is not set.');
      return res.status(500).json({ message: 'Server konfiguratsiya xatosi.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, school_id: user.school_id }, secret, {
      expiresIn: '1d',
    });

    res.json({
      message: 'Tizimga kirdingiz',
      token,
      user: {
        id: user.id,
        login: user.login,
        full_name: user.full_name,
        role: user.role,
        school_id: user.school_id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token kiritilishi shart' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Yaroqsiz Google token' });
    }

    const { email, name } = payload;
    let user = await prisma.user.findUnique({ where: { login: email } });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);
      user = await prisma.user.create({
        data: {
          login: email,
          password_hash: randomPassword,
          full_name: name || '',
          role: 'PARENT' as Role, // Default role
        }
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server konfiguratsiya xatosi.' });
    }

    const jwtToken = jwt.sign({ id: user.id, role: user.role, school_id: user.school_id }, secret, {
      expiresIn: '1d',
    });

    res.json({
      message: 'Tizimga kirdingiz',
      token: jwtToken,
      user: {
        id: user.id,
        login: user.login,
        full_name: user.full_name,
        role: user.role,
        school_id: user.school_id
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi (Google Auth)' });
  }
};

