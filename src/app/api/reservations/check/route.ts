import { NextResponse } from 'next/server';
import { isTableReserved } from '@/utils/reservationsStorage';

export async function POST(request: Request) {
  try {
    const { tableCode } = await request.json();
    const now = new Date().toISOString();
    
    const reservation = isTableReserved(tableCode, now);
    
    if (reservation) {
      return NextResponse.json({
        reserved: true,
        reservation: {
          customerName: reservation.customerName,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          date: reservation.date
        }
      });
    }
    
    return NextResponse.json({ reserved: false });
  } catch (error) {
    console.error('Error checking reservation:', error);
    return NextResponse.json({ error: 'Failed to check reservation' }, { status: 500 });
  }
}
