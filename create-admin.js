#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@qrmenu.com';
    const password = 'admin123';
    
    // Var mı kontrol et
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      console.log('✅ Admin kullanıcısı zaten var!');
      console.log('Email: admin@qrmenu.com');
      console.log('Şifre: admin123');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin',
        },
      });
      console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
      console.log('Email: admin@qrmenu.com');
      console.log('Şifre: admin123');
    }
  } catch (e) {
    console.error('Hata:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
