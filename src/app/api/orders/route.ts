import { NextRequest, NextResponse } from 'next/server';
import { loadOrders, createOrder } from '@/utils/ordersStorage';
import { loadTables, updateTable } from '@/utils/tablesStorage';

export async function GET() {
  try {
    const orders = await loadOrders();
    console.log('📋 Fetching orders:', orders.length);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Her zaman yeni sipariş oluştur (pending olarak)
    const newOrder = await createOrder({
      ...data,
      status: 'pending'
    });
    
    // Masayı kapat
    const tables = await loadTables();
    const table = tables.find((t: any) => t.code === newOrder.tableCode);
    
    if (table && table.status === 'open') {
      await updateTable(table.id, { status: 'closed' });
      console.log(`🔴 Table ${newOrder.tableCode} closed`);
    }
    
    console.log('✅ New order created:', newOrder.id, 'Table:', newOrder.tableCode);
    
    return NextResponse.json({ 
      ...newOrder, 
      orderId: newOrder.id
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
