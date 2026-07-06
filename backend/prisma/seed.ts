import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPassword = await bcrypt.hash('admin@123', 12);
  const counselorPassword = await bcrypt.hash('counselor@123', 12);

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@zolve.com' },
    update: {},
    create: {
      email: 'admin@zolve.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create counselor user
  await prisma.user.upsert({
    where: { email: 'rohan@zolve.com' },
    update: {},
    create: {
      email: 'rohan@zolve.com',
      name: 'Rohan',
      passwordHash: counselorPassword,
      role: 'COUNSELOR',
      status: 'ACTIVE',
    },
  });

  console.log('Database seeded: Admin + Counselor created');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
