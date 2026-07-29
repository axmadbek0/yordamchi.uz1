import { z } from 'zod';

export const createDailyLogSchema = z.object({
  studentId: z.string().uuid({ message: 'Yaroqsiz o\'quvchi ID' }),
  logText: z
    .string({ required_error: 'Kunlik izoh majburiy' })
    .trim()
    .min(5, 'Izoh kamida 5 ta belgidan iborat bo\'lishi kerak')
    .max(5000, 'Izoh 5000 ta belgidan oshmasligi kerak'),
  mood: z
    .enum(['xursand', 'oddiy', 'tashvishli', 'charchagan'])
    .default('oddiy'),
  health: z
    .enum(['sog\'lom', 'yengil bezovta', 'betob'])
    .default('sog\'lom'),
});

export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
