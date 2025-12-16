import { prisma } from '@/lib/prisma';

interface Table {
  id: string;
  code: string;
  status: string;
  currentOrder?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Get all tables
export const loadTables = async (): Promise<Table[]> => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { code: 'asc' }
    });
    return tables;
  } catch (error) {
    console.error('❌ Error loading tables:', error);
    return [];
  }
};

// Create table
export const createTable = async (tableData: { code: string; status?: string }): Promise<Table> => {
  try {
    const table = await prisma.table.create({
      data: tableData
    });
    console.log('💾 Table created in database');
    return table;
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  }
};

// Update table
export const updateTable = async (id: string, data: Partial<Table>): Promise<Table> => {
  try {
    const table = await prisma.table.update({
      where: { id },
      data
    });
    console.log('💾 Table updated in database');
    return table;
  } catch (error) {
    console.error('❌ Error updating table:', error);
    throw error;
  }
};

// Delete table
export const deleteTable = async (id: string): Promise<void> => {
  try {
    await prisma.table.delete({
      where: { id }
    });
    console.log('💾 Table deleted from database');
  } catch (error) {
    console.error('❌ Error deleting table:', error);
    throw error;
  }
};
