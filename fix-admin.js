const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Clear all users
    await prisma.user.deleteMany({});
    console.log('🗑️  All users deleted');

    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@qrmenu.com',
        name: 'Admin',
        password: hashedPassword,
      },
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@qrmenu.com');
    console.log('🔐 Password: admin123');

    // Verify
    const allUsers = await prisma.user.findMany();
    console.log('📊 Total users now:', allUsers.length);
    allUsers.forEach(u => console.log('  -', u.email));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
