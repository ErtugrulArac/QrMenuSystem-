import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

const CAMPAIGNS_FILE = join(process.cwd(), 'campaigns.json');

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const campaigns = await loadCampaigns();

    const filteredCampaigns = campaigns.filter(c => c.id !== id);

    if (filteredCampaigns.length === campaigns.length) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    await saveCampaigns(filteredCampaigns);
    return NextResponse.json({ message: 'Campaign deleted' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const campaigns = await loadCampaigns();

    const campaignIndex = campaigns.findIndex(c => c.id === id);

    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...body
    };

    await saveCampaigns(campaigns);
    return NextResponse.json(campaigns[campaignIndex]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const campaigns = await loadCampaigns();

    const campaignIndex = campaigns.findIndex(c => c.id === id);

    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      title: body.title,
      titleEn: body.titleEn,
      description: body.description,
      descriptionEn: body.descriptionEn,
      discount: body.discount,
      bgGradient: body.bgGradient,
      duration: body.duration || null,
      durationUnit: body.durationUnit || 'minutes',
    };

    await saveCampaigns(campaigns);
    return NextResponse.json(campaigns[campaignIndex]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
