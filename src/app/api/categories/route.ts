import { prisma } from '@/utils/connect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      include: {
        products: true,
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, ename, image } = data;

    if (!name || !ename || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const category = await prisma.categories.create({
      data: {
        name,
        ename,
        image,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
