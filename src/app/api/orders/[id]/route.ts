import { NextRequest, NextResponse } from 'next/server';
import { updateOrder, deleteOrder, deleteOrdersByTable } from '@/utils/ordersStorage';
import { loadTables, updateTable } from '@/utils/tablesStorage';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { status, paidAt, items, subtotal, tax, total, customerNote } = data;
    
    console.log(`🔄 Updating order ${params.id}`);
    
    const order = await prisma.order.findUnique({
      where: { id: params.id }
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Eğer ödendi durumuyla güncellendiyse
    if (status === 'paid') {
      // Masayı aç
      const tables = await loadTables();
      const table = tables.find((t: any) => t.code === order.tableCode);
      
      if (table) {
        await updateTable(table.id, { status: 'open' });
        console.log(`🟢 Table ${order.tableCode} reopened after payment`);
      }
      
      // Bu masanın TÜM siparişlerini sil
      const tableCode = order.tableCode;
      await deleteOrdersByTable(tableCode);
      console.log(`🧹 Deleted all orders for table ${tableCode}`);
      console.log(`💰 Order ${params.id} marked as paid`);
    } else {
      // Diğer durumlar için siparişi güncelle (items, totals dahil)
      const updateData: any = {};
      if (status) updateData.status = status;
      if (items) updateData.items = items;
      if (subtotal !== undefined) updateData.subtotal = subtotal;
      if (tax !== undefined) updateData.tax = tax;
      if (total !== undefined) updateData.total = total;
      if (paidAt) updateData.paidAt = new Date(paidAt);
      
      await updateOrder(params.id, updateData);
      
      if (items) {
        console.log(`✅ Order ${params.id} merged with new items. New total: ₺${total}`);
      } else {
        console.log(`✅ Order ${params.id} updated to: ${status}`);
      }
    }
    
    return NextResponse.json({
      id: params.id,
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteOrder(params.id);
    console.log(`🗑️ Order ${params.id} deleted`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
