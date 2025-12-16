const {PrismaClient} = require('@prisma/client');

(async () => {
  try {
    const p = new PrismaClient();
    const users = await p.user.findMany();
    console.log('✅ Database connection OK');
    console.log('📋 Total users:', users.length);
    users.forEach(u => console.log('  -', u.email, 'ID:', u.id));
    
    console.log('\n🔍 Searching for admin@qrmenu.com...');
    const admin = await p.user.findUnique({
      where: { email: 'admin@qrmenu.com' }
    });
    console.log('Result:', admin ? '✅ FOUND' : '❌ NOT FOUND');
    if (admin) {
      console.log('  Email:', admin.email);
      console.log('  Name:', admin.name);
      console.log('  Password hash:', admin.password ? '✅ Has hash' : '❌ No hash');
    }
    
    await p.$disconnect();
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
})();
