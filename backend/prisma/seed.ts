import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 12);

  const school = await prisma.school.upsert({
    where: { number: 12 },
    update: {
      name: '12-sonli Maxsus Maktab',
    },
    create: {
      number: 12,
      name: '12-sonli Maxsus Maktab',
      region: 'Toshkent shahri',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { login: 'umumi' },
    update: {
      password_hash: passwordHash,
      role: Role.TEACHER,
      school_id: school.id,
      full_name: 'Test O\'qituvchi',
    },
    create: {
      login: 'umumi',
      password_hash: passwordHash,
      role: Role.TEACHER,
      school_id: school.id,
      full_name: 'Test O\'qituvchi',
      phone: '+998901112233',
    },
  });

  const parent = await prisma.user.upsert({
    where: { login: '12_001' },
    update: {
      password_hash: passwordHash,
      role: Role.PARENT,
      school_id: school.id,
      full_name: 'Test Ota-ona',
    },
    create: {
      login: '12_001',
      password_hash: passwordHash,
      role: Role.PARENT,
      school_id: school.id,
      full_name: 'Test Ota-ona',
      phone: '+998909998877',
    },
  });

  console.log('Seed muvaffaqiyatli yakunlandi:');
  console.log({
    school: { id: school.id, number: school.number, name: school.name },
    teacher: { id: teacher.id, login: teacher.login, role: teacher.role },
    parent: { id: parent.id, login: parent.login, role: parent.role },
    password: '123456',
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
