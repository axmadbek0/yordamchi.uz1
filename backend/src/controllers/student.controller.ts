import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { school_id, parent_id } = req.query;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Kirish taqiqlangan' });
    }

    const whereClause: any = {};
    if (school_id) whereClause.school_id = school_id as string;
    if (parent_id) whereClause.parent_id = parent_id as string;

    // Enforce role constraints for listing students
    if (user.role === 'PARENT') {
      whereClause.parent_id = user.id;
    } else if (user.role === 'TEACHER') {
      whereClause.school_id = user.school_id;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        parent: {
          select: { login: true, full_name: true, phone: true }
        }
      }
    });
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Kirish taqiqlangan' });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 10
        },
        parent: {
          select: { login: true, full_name: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'O`quvchi topilmadi' });
    }

    // IDOR protection
    if (user.role === 'PARENT' && student.parent_id !== user.id) {
      return res.status(403).json({ message: 'Sizga bu o`quvchini ko`rish ruxsat etilmagan' });
    }
    if (user.role === 'TEACHER' && student.school_id !== user.school_id) {
      return res.status(403).json({ message: 'Sizga bu o`quvchini ko`rish ruxsat etilmagan' });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};
