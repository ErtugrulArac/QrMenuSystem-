const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Toplam kullanıcı sayısı:', users.length);
  console.log('Kullanıcılar:');
  users.forEach(user => {
    console.log(`- ${user.email} (ID: ${user.id})`);
  });
}

main()
  .catch((e) => {
    console.error('Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
