import { NextResponse } from 'next/server';
import { loadAnnouncements, saveAnnouncements, Announcement } from '@/utils/announcementsStorage';

export async function GET() {
  try {
    const announcements = loadAnnouncements();
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Duyurular getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Duyurular yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const announcements = loadAnnouncements();
    
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: body.title,
      titleEn: body.titleEn || body.title,
      description: body.description,
      descriptionEn: body.descriptionEn || body.description,
      bgGradient: body.bgGradient || 'from-blue-600 to-cyan-500',
      active: body.active !== undefined ? body.active : true,
      icon: body.icon || '📢',
      createdAt: new Date().toISOString(),
    };

    announcements.push(newAnnouncement);
    saveAnnouncements(announcements);

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error('Duyuru eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Duyuru eklenemedi' },
      { status: 500 }
    );
  }
}
