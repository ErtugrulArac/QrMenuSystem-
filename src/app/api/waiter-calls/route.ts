import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const calls = await prisma.waiterCall.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📞 Fetching waiter calls:', calls.length, 'pending calls');
    return NextResponse.json(calls);
  } catch (error) {
    console.error('❌ Error fetching waiter calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waiter calls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newCall = await prisma.waiterCall.create({
      data: {
        tableCode: data.tableCode,
        message: data.message,
        status: 'pending'
      }
    });
    
    console.log('🔔 New waiter call created:', newCall.id, 'Table:', newCall.tableCode);
    
    return NextResponse.json(newCall, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating waiter call:', error);
    return NextResponse.json(
      { error: 'Failed to create waiter call' },
      { status: 500 }
    );
  }
}
