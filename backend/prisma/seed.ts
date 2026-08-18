import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 12);
  const teacherAltHash = await bcrypt.hash('teacher123', 12);
  const parentAltHash = await bcrypt.hash('parent123', 12);

  // 1. Maktab
  const school = await prisma.school.upsert({
    where: { number: 12 },
    update: {
      name: '12-sonli Maxsus Maktab',
      region: 'Toshkent shahri',
    },
    create: {
      number: 12,
      name: '12-sonli Maxsus Maktab',
      region: 'Toshkent shahri',
    },
  });

  // 2. O'qituvchi 1 (umumi / 123456)
  const teacher = await prisma.user.upsert({
    where: { login: 'umumi' },
    update: {
      password_hash: passwordHash,
      role: 'TEACHER',
      school_id: school.id,
      full_name: "Rustam Ahmedov (O'qituvchi)",
      phone: '+998901112233',
    },
    create: {
      login: 'umumi',
      password_hash: passwordHash,
      role: 'TEACHER',
      school_id: school.id,
      full_name: "Rustam Ahmedov (O'qituvchi)",
      phone: '+998901112233',
    },
  });

  // 2b. O'qituvchi 2 (teacher_12 / teacher123 & 123456)
  await prisma.user.upsert({
    where: { login: 'teacher_12' },
    update: {
      password_hash: passwordHash,
      role: 'TEACHER',
      school_id: school.id,
      full_name: "Rustam Ahmedov (4-A rahbari)",
      phone: '+998901112233',
    },
    create: {
      login: 'teacher_12',
      password_hash: passwordHash,
      role: 'TEACHER',
      school_id: school.id,
      full_name: "Rustam Ahmedov (4-A rahbari)",
      phone: '+998901112233',
    },
  });

  // 3. Ota-ona (12_001 / 123456)
  const parent = await prisma.user.upsert({
    where: { login: '12_001' },
    update: {
      password_hash: passwordHash,
      role: 'PARENT',
      school_id: school.id,
      full_name: 'Aziza Karimova (Ota-ona)',
      phone: '+998909998877',
    },
    create: {
      login: '12_001',
      password_hash: passwordHash,
      role: 'PARENT',
      school_id: school.id,
      full_name: 'Aziza Karimova (Ota-ona)',
      phone: '+998909998877',
    },
  });

  // 4. Admin
  await prisma.user.upsert({
    where: { login: 'admin' },
    update: {
      password_hash: passwordHash,
      role: 'SUPER_ADMIN',
      school_id: school.id,
      full_name: 'Bosh Administrator',
    },
    create: {
      login: 'admin',
      password_hash: passwordHash,
      role: 'SUPER_ADMIN',
      school_id: school.id,
      full_name: 'Bosh Administrator',
    },
  });

  // 5. O'quvchi
  const student = await prisma.student.upsert({
    where: { id: 'std_ali_1' },
    update: {
      first_name: 'Ali',
      last_name: 'Karimov',
      class_name: '4-A sinf',
      diagnosis: 'Nutq buzilishi va diqqat yetishmovchiligi',
      school_id: school.id,
      parent_id: parent.id,
    },
    create: {
      id: 'std_ali_1',
      first_name: 'Ali',
      last_name: 'Karimov',
      class_name: '4-A sinf',
      diagnosis: 'Nutq buzilishi va diqqat yetishmovchiligi',
      school_id: school.id,
      parent_id: parent.id,
    },
  });

  // 6. Bugungi kunlik qayd
  await prisma.dailyLog.create({
    data: {
      student_id: student.id,
      mood: '🌟 Xursand',
      health: 'Sog‘lom',
      teacher_note:
        "Bugun matematika darsida faol qatnashdi. Sensorika mashg'ulotlarida mayda motorika mashqlarini a'lo darajada bajardi. Tushlikni to'liq yedi.",
      ai_analysis:
        "🌟 AI Pedagogik xulosa: Bolaning ijtimoiy faolligi va diqqatni jamlash ko'rsatkichi yaxshilangan. Uyda sensorik o'yinlar bilan shug'ullanish tavsiya etiladi.",
    },
  });

  console.log('Seed muvaffaqiyatli yakunlandi:');
  console.log({
    school: { id: school.id, number: school.number, name: school.name },
    teacher: { login: 'umumi', role: 'TEACHER', password: '123456' },
    teacher_alt: { login: 'teacher_12', role: 'TEACHER', password: '123456' },
    parent: { login: '12_001', role: 'PARENT', password: '123456' },
    student: { name: 'Ali Karimov', class: '4-A sinf' },
  });
}

main()
  .catch((error) => {
    console.error('Seed xatosi:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
