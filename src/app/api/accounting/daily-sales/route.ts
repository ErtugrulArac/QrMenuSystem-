import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const dailySalesFile = path.join(process.cwd(), 'daily-sales.json');

// Daily sales dosyasını yükle
const loadDailySales = (): Map<string, any> => {
  try {
    if (fs.existsSync(dailySalesFile)) {
      const data = fs.readFileSync(dailySalesFile, 'utf-8');
      const sales = JSON.parse(data);
      return new Map(Object.entries(sales));
    }
  } catch (error) {
    console.error('❌ Error loading daily sales file:', error);
  }
  return new Map();
};

// Daily sales dosyasını kaydet
const saveDailySales = (sales: Map<string, any>) => {
  try {
    const obj = Object.fromEntries(sales);
    fs.writeFileSync(dailySalesFile, JSON.stringify(obj, null, 2), 'utf-8');
    console.log('💾 Daily sales saved to file');
  } catch (error) {
    console.error('❌ Error saving daily sales file:', error);
  }
};

// 60 günden eski kayıtları temizle
const cleanupOldSales = (sales: Map<string, any>): number => {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
  let deletedCount = 0;

  for (const [id, sale] of sales.entries()) {
    const saleDate = new Date(sale.paidAt);
    if (saleDate < sixtyDaysAgo) {
      sales.delete(id);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    saveDailySales(sales);
    console.log(`🗑️ Cleaned up ${deletedCount} sales older than 60 days`);
  }

  return deletedCount;
};

let dailySalesStorage = loadDailySales();

export async function GET() {
  try {
    dailySalesStorage = loadDailySales(); // Her GET'te dosyadan yeniden yükle
    
    // 60 günden eski kayıtları temizle
    cleanupOldSales(dailySalesStorage);
    
    const sales = Array.from(dailySalesStorage.values());
    
    // Tarihe göre grupla
    const salesByDate = sales.reduce((acc: any, sale: any) => {
      const date = new Date(sale.paidAt).toLocaleDateString('tr-TR');
      if (!acc[date]) {
        acc[date] = {
          date,
          orders: [],
          totalSales: 0,
          totalTax: 0,
          totalRevenue: 0,
          orderCount: 0
        };
      }
      
      acc[date].orders.push(sale);
      acc[date].totalSales += sale.subtotal;
      acc[date].totalTax += sale.tax;
      acc[date].totalRevenue += sale.total;
      acc[date].orderCount += 1;
      
      return acc;
    }, {});

    // Array'e çevir ve tarihe göre sırala (en yeni en üstte)
    const sortedSales = Object.values(salesByDate).sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    console.log('📊 Daily sales fetched:', sortedSales.length, 'days');
    
    return NextResponse.json(sortedSales);
  } catch (error) {
    console.error('❌ Error fetching daily sales:', error);
    return NextResponse.json({ error: 'Failed to fetch daily sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sale = await request.json();
    const saleId = `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newSale = {
      id: saleId,
      ...sale,
      createdAt: new Date().toISOString()
    };

    dailySalesStorage.set(saleId, newSale);
    saveDailySales(dailySalesStorage);
    
    console.log('💰 New sale recorded:', saleId, 'Total:', sale.total);
    console.log('📊 Total sales count:', dailySalesStorage.size);
    
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error('❌ Error recording sale:', error);
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
  }
}

// Gün sonu raporu sıfırlama (yeni güne geçerken)
export async function DELETE() {
  try {
    const count = dailySalesStorage.size;
    dailySalesStorage.clear();
    saveDailySales(dailySalesStorage);
    
    console.log('🗑️ Daily sales cleared:', count, 'records deleted');
    
    return NextResponse.json({ message: 'Daily sales cleared', count });
  } catch (error) {
    console.error('❌ Error clearing daily sales:', error);
    return NextResponse.json({ error: 'Failed to clear daily sales' }, { status: 500 });
  }
}
