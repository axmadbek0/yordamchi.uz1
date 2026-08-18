import { Prisma } from '@prisma/client';
import { Role } from '../types/auth.types';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { hashPassword } from '../utils/hash';
import { generateParentCredentials } from '../utils/generateCredentials';
import { CreateStudentInput } from '../validations/student.validation';

const studentInclude = {
  parent: {
    select: { id: true, login: true, full_name: true, phone: true },
  },
  school: {
    select: { id: true, number: true, name: true },
  },
} as const;

/**
 * Yangi o'quvchi yaratish.
 * TEACHER/SCHOOL_ADMIN uchun school_id token'dan olinadi.
 */
export async function createStudent(
  data: CreateStudentInput,
  actor: {
    userId: string;
    role: Role;
    schoolId: string | null;
  }
) {
  if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'].includes(actor.role)) {
    throw AppError.forbidden('O\'quvchi qo\'shish uchun ruxsat yo\'q');
  }

  let schoolId = data.school_id ?? null;

  if (actor.role === 'TEACHER' || actor.role === 'SCHOOL_ADMIN') {
    if (!actor.schoolId) {
      throw AppError.forbidden('Maktab bog\'lanishi topilmadi');
    }
    // O'qituvchi faqat o'z maktabiga qo'shadi
    if (schoolId && schoolId !== actor.schoolId) {
      throw AppError.forbidden('Ruxsat rad etildi');
    }
    schoolId = actor.schoolId;
  }

  if (!schoolId) {
    throw AppError.badRequest('school_id majburiy');
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    throw AppError.notFound('Maktab topilmadi');
  }

  if (data.parent_id) {
    const parent = await prisma.user.findUnique({ where: { id: data.parent_id } });
    if (!parent || parent.role !== 'PARENT') {
      throw AppError.badRequest('Noto\'g\'ri parent_id');
    }
  }

  return prisma.$transaction(async (tx) => {
    let parentId = data.parent_id ?? null;
    let parentCredentials: { login: string; password: string } | null = null;

    if (!parentId && data.parent_phone) {
      const sequenceNumber = await resolveNextParentSequence(tx, schoolId, school.number);
      const creds = generateParentCredentials(school.number, sequenceNumber);

      // Taqiqlash: login band bo'lsa ketma-ket keyingisini sinab ko'rish
      let login = creds.login;
      let seq = sequenceNumber;
      for (let attempt = 0; attempt < 50; attempt++) {
        const exists = await tx.user.findUnique({ where: { login } });
        if (!exists) break;
        seq += 1;
        login = generateParentCredentials(school.number, seq).login;
      }

      const finalCreds = { ...creds, login };
      const password_hash = await hashPassword(finalCreds.password);

      const parent = await tx.user.create({
        data: {
          login: finalCreds.login,
          password_hash,
          role: Role.PARENT,
          phone: data.parent_phone,
          school_id: schoolId,
          full_name: `${data.first_name} ${data.last_name} ota-onasi`,
        },
      });

      parentId = parent.id;
      parentCredentials = finalCreds;
    }

    const student = await tx.student.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        class_name: data.class_name,
        dob: new Date(`${data.dob}T00:00:00.000Z`),
        diagnosis: data.diagnosis,
        school_id: schoolId,
        parent_id: parentId,
      },
      include: studentInclude,
    });

    return { student, parentCredentials };
  });
}

/**
 * Maktabdagi eng oxirgi PARENT loginidan (masalan 12_005) keyingi sequence ni hisoblaydi.
 * Hech kim yo'q bo'lsa → 1.
 */
async function resolveNextParentSequence(
  tx: Prisma.TransactionClient,
  schoolId: string,
  schoolNumber: number
): Promise<number> {
  const loginPrefix = `${schoolNumber}_`;

  const lastParent = await tx.user.findFirst({
    where: {
      school_id: schoolId,
      role: Role.PARENT,
      login: { startsWith: loginPrefix },
    },
    orderBy: { login: 'desc' },
    select: { login: true },
  });

  if (!lastParent) {
    return 1;
  }

  const suffix = lastParent.login.slice(loginPrefix.length);
  const parsed = Number.parseInt(suffix, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 1;
  }

  return parsed + 1;
}

/**
 * Rolga qarab o'quvchilar ro'yxati.
 * PARENT → faqat o'z farzandlari (parent_id = userId)
 * TEACHER/SCHOOL_ADMIN → o'z maktabi
 */
export async function getStudents(
  userId: string,
  role: Role,
  schoolId: string | null
) {
  const where: Prisma.StudentWhereInput = {};

  if (role === 'PARENT') {
    where.parent_id = userId;
  } else if (role === 'TEACHER' || role === 'SCHOOL_ADMIN') {
    if (!schoolId) {
      throw AppError.forbidden('Maktab bog\'lanishi topilmadi');
    }
    where.school_id = schoolId;
  } else if (role !== 'SUPER_ADMIN') {
    throw AppError.forbidden();
  }

  return prisma.student.findMany({
    where,
    include: studentInclude,
    orderBy: [{ class_name: 'asc' }, { last_name: 'asc' }],
  });
}

export async function getStudentById(
  studentId: string,
  userId: string,
  role: Role,
  schoolId: string | null
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      ...studentInclude,
      logs: {
        orderBy: { date: 'desc' },
        take: role === 'PARENT' ? 30 : 10,
      },
    },
  });

  if (!student) {
    throw AppError.notFound('O\'quvchi topilmadi');
  }

  if (role === 'PARENT' && student.parent_id !== userId) {
    throw AppError.forbidden();
  }

  if (
    (role === 'TEACHER' || role === 'SCHOOL_ADMIN') &&
    student.school_id !== schoolId
  ) {
    throw AppError.forbidden();
  }

  return student;
}

export async function getOwnChildren(userId: string) {
  return prisma.student.findMany({
    where: { parent_id: userId },
    include: studentInclude,
    orderBy: { created_at: 'desc' },
  });
}
