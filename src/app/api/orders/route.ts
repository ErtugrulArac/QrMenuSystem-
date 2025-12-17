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
    
    console.log('📦 Incoming order data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.tableCode || !data.items || !Array.isArray(data.items)) {
      console.error('❌ Missing required fields:', { tableCode: data.tableCode, items: data.items });
      return NextResponse.json(
        { error: 'tableCode ve items alanları gereklidir' },
        { status: 400 }
      );
    }
    
    // Her zaman yeni sipariş oluştur (pending olarak)
    const newOrder = await createOrder({
      tableCode: data.tableCode,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: 'pending',
      customerNote: data.customerNote || null
    });
    
    console.log('✅ New order created:', newOrder.id, 'Table:', newOrder.tableCode);
    
    // Masayı kapat
    try {
      const tables = await loadTables();
      const table = tables.find((t: any) => t.code === newOrder.tableCode);
      
      if (table && table.status === 'open') {
        await updateTable(table.id, { status: 'closed' });
        console.log(`🔴 Table ${newOrder.tableCode} closed`);
      }
    } catch (tableError) {
      console.warn('⚠️ Could not update table status:', tableError);
      // Don't fail the order if table update fails
    }
    
    return NextResponse.json({ 
      ...newOrder, 
      orderId: newOrder.id
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
