const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Varsayılan admin kullanıcısı
  const email = 'admin@qrmenu.com';
  const password = 'admin123';
  
  // Kullanıcı zaten var mı kontrol et
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Admin kullanıcısı zaten var!');
    console.log(`Email: ${email}`);
    console.log(`Şifre: ${password}`);
    return;
  }

  // Şifreyi hash'le
  const hashedPassword = await bcrypt.hash(password, 10);

  // Yeni admin kullanıcısı oluştur
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin',
    },
  });

  console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
  console.log('---');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Şifre: ${password}`);
  console.log('---');
  console.log('Giriş sayfası: http://localhost:3003/auth/login');
}

main()
  .catch((e) => {
    console.error('Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
