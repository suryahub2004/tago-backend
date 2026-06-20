import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@tago.io';
  const password = 'tago@123';
  
  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: await bcrypt.hash(password, 12),
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: 'Tago Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`✅ Upserted user: ${email} with role SUPER_ADMIN`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
