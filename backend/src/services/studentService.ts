/**
 * Orqaga moslik — eski importlar yangi service'ga o'tadi.
 */
export {
  createStudent as createStudentLegacy,
} from './student.service';

import { AuthUser } from '../types/auth.types';
import { AppError } from '../utils/AppError';
import {
  createStudent as createStudentCore,
  getStudents,
  getStudentById,
  getOwnChildren as getOwnChildrenCore,
} from './student.service';
import { CreateStudentInput } from '../validations/student.validation';

export async function createStudent(actor: AuthUser | undefined, input: CreateStudentInput) {
  if (!actor) throw AppError.unauthorized();
  return createStudentCore(input, {
    userId: actor.id,
    role: actor.role,
    schoolId: actor.school_id,
  });
}

export async function getStudentsByRole(actor: AuthUser | undefined) {
  if (!actor) throw AppError.unauthorized();
  return getStudents(actor.id, actor.role, actor.school_id);
}

export async function getStudentByIdForActor(actor: AuthUser | undefined, studentId: string) {
  if (!actor) throw AppError.unauthorized();
  return getStudentById(studentId, actor.id, actor.role, actor.school_id);
}

export async function getOwnChildren(actor: AuthUser | undefined) {
  if (!actor) throw AppError.unauthorized();
  if (actor.role !== 'PARENT') throw AppError.forbidden();
  return getOwnChildrenCore(actor.id);
}
