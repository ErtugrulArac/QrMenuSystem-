import { NextResponse } from 'next/server';
import { loadAnnouncements, saveAnnouncements } from '@/utils/announcementsStorage';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const announcements = loadAnnouncements();
    
    const index = announcements.findIndex((a) => a.id === params.id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı' },
        { status: 404 }
      );
    }

    announcements[index] = {
      ...announcements[index],
      ...body,
    };

    saveAnnouncements(announcements);
    return NextResponse.json(announcements[index]);
  } catch (error) {
    console.error('Duyuru güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Duyuru güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const announcements = loadAnnouncements();
    const filtered = announcements.filter((a) => a.id !== params.id);
    
    if (filtered.length === announcements.length) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı' },
        { status: 404 }
      );
    }

    saveAnnouncements(filtered);
    return NextResponse.json({ message: 'Duyuru silindi' });
  } catch (error) {
    console.error('Duyuru silinirken hata:', error);
    return NextResponse.json(
      { error: 'Duyuru silinemedi' },
      { status: 500 }
    );
  }
}
