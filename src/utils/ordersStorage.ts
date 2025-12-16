import { prisma } from '@/lib/prisma';

// Get all orders
export const loadOrders = async (): Promise<any[]> => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return orders;
  } catch (error) {
    console.error('❌ Error loading orders:', error);
    return [];
  }
};

// Get orders by table
export const getOrdersByTable = async (tableCode: string): Promise<any[]> => {
  try {
    const orders = await prisma.order.findMany({
      where: { tableCode },
      orderBy: { createdAt: 'desc' }
    });
    return orders;
  } catch (error) {
    console.error('❌ Error loading orders by table:', error);
    return [];
  }
};

// Create order
export const createOrder = async (orderData: any): Promise<any> => {
  try {
    const order = await prisma.order.create({
      data: orderData
    });
    console.log('💾 Order created in database');
    return order;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (id: string, data: any): Promise<any> => {
  try {
    const order = await prisma.order.update({
      where: { id },
      data
    });
    console.log('💾 Order updated in database');
    return order;
  } catch (error) {
    console.error('❌ Error updating order:', error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await prisma.order.delete({
      where: { id }
    });
    console.log('💾 Order deleted from database');
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    throw error;
  }
};

// Delete orders by table
export const deleteOrdersByTable = async (tableCode: string): Promise<void> => {
  try {
    await prisma.order.deleteMany({
      where: { tableCode }
    });
    console.log('💾 Orders deleted by table from database');
  } catch (error) {
    console.error('❌ Error deleting orders by table:', error);
    throw error;
  }
};
