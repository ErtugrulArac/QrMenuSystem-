import fs from 'fs';
import path from 'path';

const announcementsFilePath = path.join(process.cwd(), 'announcements.json');

export interface Announcement {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  bgGradient: string;
  active: boolean;
  createdAt: string;
  icon?: string; // Emoji veya icon
}

export function loadAnnouncements(): Announcement[] {
  try {
    if (!fs.existsSync(announcementsFilePath)) {
      fs.writeFileSync(announcementsFilePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(announcementsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Duyurular yüklenirken hata:', error);
    return [];
  }
}

export function saveAnnouncements(announcements: Announcement[]): void {
  try {
    fs.writeFileSync(announcementsFilePath, JSON.stringify(announcements, null, 2));
  } catch (error) {
    console.error('Duyurular kaydedilirken hata:', error);
    throw error;
  }
}
