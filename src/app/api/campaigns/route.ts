import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

interface Campaign {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  discount: string;
  bgGradient: string;
  active: boolean;
  createdAt: string;
  duration?: number | null;
  durationUnit?: 'minutes' | 'hours' | 'days';
}

const CAMPAIGNS_FILE = join(process.cwd(), 'campaigns.json');

async function loadCampaigns(): Promise<Campaign[]> {
  try {
    const data = await fs.readFile(CAMPAIGNS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveCampaigns(campaigns: Campaign[]): Promise<void> {
  await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
}

export async function GET(req: NextRequest) {
  try {
    const campaigns = await loadCampaigns();
    const activeCampaigns = campaigns.filter(c => c.active);
    return NextResponse.json(activeCampaigns);
  } catch (error) {
    console.error('Error loading campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to load campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const campaigns = await loadCampaigns();

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      title: body.title,
      titleEn: body.titleEn,
      description: body.description,
      descriptionEn: body.descriptionEn,
      discount: body.discount,
      bgGradient: body.bgGradient,
      active: true,
      createdAt: new Date().toISOString(),
      duration: body.duration || null,
      durationUnit: body.durationUnit || 'minutes',
    };

    campaigns.push(newCampaign);
    await saveCampaigns(campaigns);

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
