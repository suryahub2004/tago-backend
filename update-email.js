const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.user.updateMany({
    where: { email: 'admin@smartvital.io' },
    data: { email: 'admin@tago.io' }
  });
  console.log("Updated email to admin@tago.io");
}
run();
