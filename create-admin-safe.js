const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Checking current database connection...');
    
    // Check existing users
    const existingUsers = await prisma.user.findMany();
    console.log('✅ Database connected');
    console.log(`📋 Existing users: ${existingUsers.length}`);
    existingUsers.forEach(u => console.log(`  - ${u.email}`));

    // Delete old admin if exists
    await prisma.user.deleteMany({ where: { email: 'admin@qrmenu.com' } });
    console.log('🗑️  Old admin user deleted');

    // Create new admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@qrmenu.com',
        name: 'Admin',
        password: hashedPassword,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@qrmenu.com');
    console.log('🔐 Password: admin123');
    console.log('🆔 User ID:', newAdmin.id);

    // Verify it's there
    const verify = await prisma.user.findUnique({
      where: { email: 'admin@qrmenu.com' }
    });
    console.log('✅ Verification: User found in database:', verify?.email);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
