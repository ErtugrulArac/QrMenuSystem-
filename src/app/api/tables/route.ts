import { NextRequest, NextResponse } from 'next/server';
import { loadTables, createTable } from '@/utils/tablesStorage';

export async function GET(req: NextRequest) {
  try {
    const tables = await loadTables();
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error loading tables:', error);
    return NextResponse.json(
      { error: 'Failed to load tables' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Table code is required' },
        { status: 400 }
      );
    }

    const tables = await loadTables();

    // Aynı kodda masa var mı kontrol et
    if (tables.some(t => t.code === code)) {
      return NextResponse.json(
        { error: 'Table with this code already exists' },
        { status: 400 }
      );
    }

    const newTable = await createTable({
      code,
      status: 'open'
    });

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}
