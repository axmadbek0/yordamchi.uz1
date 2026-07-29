import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { AppError } from '../utils/AppError';
import {
  createStudent,
  getStudents,
  getStudentById,
  getOwnChildren,
} from '../services/student.service';
import { CreateStudentInput } from '../validations/student.validation';

/**
 * GET /api/students
 */
export async function getAll(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const students = await getStudents(
      req.user.id,
      req.user.role,
      req.user.school_id
    );

    res.json(students);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/students
 */
export async function create(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const input = req.body as CreateStudentInput;

    const result = await createStudent(input, {
      userId: req.user.id,
      role: req.user.role,
      schoolId: req.user.school_id,
    });

    res.status(201).json({
      message: 'O\'quvchi muvaffaqiyatli qo\'shildi',
      student: result.student,
      parentCredentials: result.parentCredentials,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/students/:id
 */
export async function getOne(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const student = await getStudentById(
      req.params.id,
      req.user.id,
      req.user.role,
      req.user.school_id
    );

    res.json(student);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/students/me/children — faqat PARENT
 */
export async function getMyChildren(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    const children = await getOwnChildren(req.user.id);
    res.json(children);
  } catch (error) {
    next(error);
  }
}
