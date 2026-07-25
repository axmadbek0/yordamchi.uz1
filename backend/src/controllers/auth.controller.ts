import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ushbu email bilan foydalanuvchi mavjud' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash,
      },
    });

    res.status(201).json({ message: 'Ro`yxatdan muvaffaqiyatli o`tdingiz', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email yoki parol noto`g`ri' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email yoki parol noto`g`ri' });
    }

    const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_me_in_production';
    const token = jwt.sign({ id: user.id, role: user.role }, secret, {
      expiresIn: '1d',
    });

    res.json({
      message: 'Tizimga kirdingiz',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};
