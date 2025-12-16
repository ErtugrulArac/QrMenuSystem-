import fs from 'fs';
import path from 'path';

const reservationsFile = path.join(process.cwd(), 'reservations.json');

export interface Reservation {
  id: string;
  tableCode: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  date: string;
  note?: string;
  createdAt: string;
}

export const loadReservations = (): Reservation[] => {
  try {
    if (fs.existsSync(reservationsFile)) {
      const data = fs.readFileSync(reservationsFile, 'utf-8');
      const reservations = JSON.parse(data);
      return Object.values(reservations);
    }
  } catch (error) {
    console.error('Error loading reservations:', error);
  }
  return [];
};

export const saveReservations = (reservations: Reservation[]) => {
  try {
    const obj = reservations.reduce((acc, res) => {
      acc[res.id] = res;
      return acc;
    }, {} as Record<string, Reservation>);
    fs.writeFileSync(reservationsFile, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving reservations:', error);
  }
};

export const isTableReserved = (tableCode: string, dateTime: string): Reservation | null => {
  const reservations = loadReservations();
  const checkDate = new Date(dateTime);
  
  for (const reservation of reservations) {
    const resDate = new Date(reservation.date);
    const resStartTime = new Date(`${reservation.date}T${reservation.startTime}`);
    const resEndTime = new Date(`${reservation.date}T${reservation.endTime}`);
    
    // Aynı masa ve tarihte, zaman aralığı çakışıyorsa
    if (
      reservation.tableCode === tableCode &&
      resDate.toDateString() === checkDate.toDateString() &&
      checkDate >= resStartTime &&
      checkDate <= resEndTime
    ) {
      return reservation;
    }
  }
  
  return null;
};
