import { z } from 'zod';

const uuidSchema = z.string().uuid({ message: 'Yaroqsiz UUID format' });

const nameSchema = z
  .string({ required_error: 'Maydon majburiy' })
  .trim()
  .min(2, 'Kamida 2 ta belgi bo\'lishi kerak')
  .max(100, '100 ta belgidan oshmasligi kerak');

/**
 * Yangi o'quvchi yaratish.
 * snake_case asosiy; camelCase frontend uchun qabul qilinadi.
 */
export const createStudentSchema = z
  .object({
    first_name: nameSchema.optional(),
    last_name: nameSchema.optional(),
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),

    class_name: z.string().trim().min(2).max(50).optional(),
    className: z.string().trim().min(2).max(50).optional(),

    dob: z
      .string({ required_error: 'Tug\'ilgan sana majburiy' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Sana YYYY-MM-DD formatida bo\'lishi kerak'),

    diagnosis: z.string().trim().max(500).optional(),

    parent_id: uuidSchema.optional().nullable(),
    parentId: uuidSchema.optional().nullable(),

    school_id: uuidSchema.optional(),
    schoolId: uuidSchema.optional(),

    parent_phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s\-()]{9,20}$/, 'Telefon raqami noto\'g\'ri formatda')
      .optional(),
    parentPhone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s\-()]{9,20}$/, 'Telefon raqami noto\'g\'ri formatda')
      .optional(),
  })
  .refine((d) => Boolean(d.first_name || d.firstName), {
    message: 'first_name majburiy',
    path: ['first_name'],
  })
  .refine((d) => Boolean(d.last_name || d.lastName), {
    message: 'last_name majburiy',
    path: ['last_name'],
  })
  .transform((data) => ({
    first_name: (data.first_name ?? data.firstName) as string,
    last_name: (data.last_name ?? data.lastName) as string,
    class_name: data.class_name ?? data.className ?? '4-A',
    dob: data.dob,
    diagnosis: data.diagnosis,
    parent_id: data.parent_id ?? data.parentId ?? null,
    school_id: data.school_id ?? data.schoolId,
    parent_phone: data.parent_phone ?? data.parentPhone,
  }));

export const studentIdParamSchema = z.object({
  id: uuidSchema,
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
