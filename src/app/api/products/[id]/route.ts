import { prisma } from '@/utils/connect';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { name, ename, categoryId, image, price, description, edescription } =
      data;

    const product = await prisma.products.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(ename && { ename }),
        ...(categoryId && { categoryId }),
        ...(image && { image }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(description !== undefined && { description }),
        ...(edescription !== undefined && { edescription }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.products.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
