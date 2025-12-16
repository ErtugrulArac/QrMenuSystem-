import { NextResponse } from 'next/server';
import { loadReservations, saveReservations, Reservation } from '@/utils/reservationsStorage';

export async function GET() {
  try {
    const reservations = loadReservations();
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reservations = loadReservations();
    
    const newReservation: Reservation = {
      id: `reservation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tableCode: body.tableCode,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      startTime: body.startTime,
      endTime: body.endTime,
      date: body.date,
      note: body.note || '',
      createdAt: new Date().toISOString()
    };
    
    reservations.push(newReservation);
    saveReservations(reservations);
    
    console.log('✅ New reservation created:', newReservation.id);
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
