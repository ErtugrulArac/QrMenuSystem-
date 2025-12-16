const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('🚀 Starting migration...\n');

    // 1. Migrate Tables
    console.log('📋 Migrating tables...');
    const tablesFile = path.join(process.cwd(), 'tables.json');
    if (fs.existsSync(tablesFile)) {
      const tablesData = JSON.parse(fs.readFileSync(tablesFile, 'utf-8'));
      const tables = Array.isArray(tablesData) ? tablesData : Object.values(tablesData);
      
      for (const table of tables) {
        await prisma.table.upsert({
          where: { code: table.code },
          update: {
            status: table.status || 'closed'
          },
          create: {
            code: table.code,
            status: table.status || 'closed',
            currentOrder: table.currentOrder || null
          }
        });
      }
      console.log(`✅ Migrated ${tables.length} tables\n`);
    } else {
      console.log('⚠️  No tables.json found\n');
    }

    // 2. Migrate Orders
    console.log('📦 Migrating orders...');
    const ordersFile = path.join(process.cwd(), 'orders.json');
    if (fs.existsSync(ordersFile)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
      const orders = Array.isArray(ordersData) 
        ? ordersData 
        : Object.values(ordersData);
      
      for (const order of orders) {
        try {
          await prisma.order.create({
            data: {
              tableCode: order.tableCode,
              items: order.items,
              subtotal: order.subtotal,
              tax: order.tax,
              total: order.total,
              status: order.status || 'pending',
              createdAt: new Date(order.createdAt),
              paidAt: order.paidAt ? new Date(order.paidAt) : null
            }
          });
        } catch (error) {
          console.error(`❌ Error migrating order ${order.id}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${orders.length} orders\n`);
    } else {
      console.log('⚠️  No orders.json found\n');
    }

    // 3. Migrate Waiter Calls
    console.log('📞 Migrating waiter calls...');
    const callsFile = path.join(process.cwd(), 'waiter-calls.json');
    if (fs.existsSync(callsFile)) {
      const callsData = JSON.parse(fs.readFileSync(callsFile, 'utf-8'));
      const calls = Array.isArray(callsData) ? callsData : Object.values(callsData);
      
      for (const call of calls) {
        try {
          await prisma.waiterCall.create({
            data: {
              tableCode: call.tableCode,
              message: call.message || null,
              status: call.status || 'pending',
              createdAt: new Date(call.createdAt),
              resolvedAt: call.resolvedAt ? new Date(call.resolvedAt) : null
            }
          });
        } catch (error) {
          console.error(`❌ Error migrating waiter call ${call.id}:`, error.message);
        }
      }
      console.log(`✅ Migrated ${calls.length} waiter calls\n`);
    } else {
      console.log('⚠️  No waiter-calls.json found\n');
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Final counts:');
    console.log(`   Tables: ${await prisma.table.count()}`);
    console.log(`   Orders: ${await prisma.order.count()}`);
    console.log(`   Waiter Calls: ${await prisma.waiterCall.count()}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
