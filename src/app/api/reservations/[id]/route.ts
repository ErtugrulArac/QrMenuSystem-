import { NextResponse } from 'next/server';
import { loadReservations, saveReservations } from '@/utils/reservationsStorage';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservations = loadReservations();
    const filteredReservations = reservations.filter(r => r.id !== params.id);
    
    if (filteredReservations.length === reservations.length) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    saveReservations(filteredReservations);
    console.log('🗑️ Reservation deleted:', params.id);
    
    return NextResponse.json({ message: 'Reservation deleted' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
