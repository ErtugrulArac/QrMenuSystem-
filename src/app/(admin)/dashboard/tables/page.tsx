'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Table {
  id: string;
  code: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export default function TablesManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [newTableCode, setNewTableCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // API'den masaları yükle
  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tables');
      if (response.ok) {
        const data = await response.json();
        // Eğer data array ise, direkt kullan. Değilse boş array kullan
        setTables(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Masalar yüklenirken hata:', error);
      toast.error('Masalar yüklenemedi');
      setTables([]); // Hata durumunda boş array kullan
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const addTable = async () => {
    if (!newTableCode.trim()) {
      toast.error('Masa kodu boş olamaz!');
      return;
    }

    if (tables.some(t => t.code === newTableCode)) {
      toast.error('Bu masa kodu zaten var!');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newTableCode })
      });

      if (response.ok) {
        const newTable = await response.json();
        setTables([...tables, newTable]);
        setNewTableCode('');
        setShowModal(false);
        toast.success(`${newTableCode} masası eklendi!`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Masa eklenemedi');
      }
    } catch (error) {
      console.error('Masa eklenirken hata:', error);
      toast.error('Masa eklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTable = async (id: string, code: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tables/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTables(tables.filter(t => t.id !== id));
        toast.success(`${code} masası silindi!`);
      } else {
        toast.error('Masa silinemedi');
      }
    } catch (error) {
      console.error('Masa silinirken hata:', error);
      toast.error('Masa silinemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTableStatus = async (id: string) => {
    const table = tables.find(t => t.id === id);
    if (!table) return;

    const newStatus = table.status === 'open' ? 'closed' : 'open';

    try {
      setIsLoading(true);
      const response = await fetch(`/api/tables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setTables(tables.map(t => 
          t.id === id 
            ? { ...t, status: newStatus }
            : t
        ));
        toast.success(`Masa durumu güncellendi`);
      } else {
        toast.error('Masa durumu güncellenemedi');
      }
    } catch (error) {
      console.error('Masa durumu güncellenirken hata:', error);
      toast.error('Masa durumu güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-40 w-full'>
        <div className='w-full px-4 md:px-8 py-4 md:py-6'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div className='flex items-start gap-2 md:gap-4 flex-1'>
              <Link href="/dashboard" className='p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0'>
                <FiArrowLeft className='w-5 md:w-6 h-5 md:h-6 text-gray-600' />
              </Link>
              <div className='min-w-0'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 break-words'>Masa Yönetimi</h1>
                <p className='text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1'>Toplam {tables.length} masa</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={isLoading}
              className='flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm md:text-base whitespace-nowrap flex-shrink-0'
            >
              <FiPlus className='w-4 md:w-5 h-4 md:h-5' />
              <span className='hidden sm:inline'>Masa Ekle</span>
              <span className='sm:hidden'>Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full px-4 md:px-8 py-6 md:py-8'>
        {/* Tables Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4'>
          {tables.map(table => (
            <div
              key={table.id}
              className={`rounded-lg md:rounded-xl p-3 md:p-6 border-2 transition-all duration-300 ${
                table.status === 'open'
                  ? 'bg-white border-green-300 shadow-md'
                  : 'bg-gray-50 border-gray-300 opacity-75'
              }`}
            >
              {/* Status Badge */}
              <div className='flex items-center justify-between mb-2 md:mb-4'>
                <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold ${
                  table.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {table.status === 'open' ? '🟢' : '🔴'}
                </span>
              </div>

              {/* Table Code */}
              <h3 className='text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4 truncate'>{table.code}</h3>

              {/* Actions */}
              <div className='flex gap-1 md:gap-2'>
                <button
                  onClick={() => toggleTableStatus(table.id)}
                  disabled={isLoading}
                  className={`flex-1 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    table.status === 'open'
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <span className='hidden md:inline'>{table.status === 'open' ? 'Kapat' : 'Aç'}</span>
                  <span className='md:hidden'>{table.status === 'open' ? '⊗' : '⊙'}</span>
                </button>
                <button
                  onClick={() => deleteTable(table.id, table.code)}
                  disabled={isLoading}
                  className={`p-1.5 md:p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiTrash2 className='w-4 md:w-5 h-4 md:h-5' />
                </button>
              </div>
            </div>
          ))}
        </div>

        {tables.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-600 mb-4'>Henüz masa eklenmemiş</p>
            <button
              onClick={() => setShowModal(true)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              İlk Masayı Ekle
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-3 md:p-4 z-50'>
          <div className='bg-white rounded-lg md:rounded-xl p-4 md:p-8 max-w-md w-full'>
            <h2 className='text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6'>Masa Ekle</h2>

            <div className='mb-4 md:mb-6'>
              <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                Masa Kodu (örn: M1, M2)
              </label>
              <input
                type='text'
                value={newTableCode}
                onChange={(e) => setNewTableCode(e.target.value.toUpperCase())}
                placeholder='M1'
                className='w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                onKeyPress={(e) => e.key === 'Enter' && addTable()}
              />
            </div>

            <div className='flex gap-2 md:gap-3'>
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className='flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50'
              >
                İptal
              </button>
              <button
                onClick={addTable}
                disabled={isLoading}
                className='flex-1 px-3 md:px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50'
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
