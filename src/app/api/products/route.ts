import { prisma } from '@/utils/connect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: {
        category: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, ename, categoryId, image, price, description, edescription } =
      data;

    if (!name || !ename || !categoryId || !image || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = await prisma.products.create({
      data: {
        name,
        ename,
        categoryId,
        image,
        price: parseInt(price),
        description: description || '',
        edescription: edescription || '',
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
