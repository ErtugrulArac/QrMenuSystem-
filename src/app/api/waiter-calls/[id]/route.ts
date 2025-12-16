import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { status } = data;
    
    // Eğer status 'resolved' ise resolvedAt ekle
    if (status === 'resolved' || status === 'completed') {
      await prisma.waiterCall.update({
        where: { id: params.id },
        data: {
          status: 'resolved',
          resolvedAt: new Date()
        }
      });
      console.log(`✅ Waiter call ${params.id} completed`);
    } else {
      await prisma.waiterCall.update({
        where: { id: params.id },
        data: { status }
      });
      console.log(`🔄 Waiter call ${params.id} updated to: ${status}`);
    }
    
    return NextResponse.json({
      id: params.id,
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating waiter call:', error);
    return NextResponse.json(
      { error: 'Failed to update waiter call' },
      { status: 500 }
    );
  }
}
