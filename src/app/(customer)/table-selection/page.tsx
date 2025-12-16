'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

export default function TableSelectionPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedClosedTable, setSelectedClosedTable] = useState<string | null>(null);
  const [reservationWarning, setReservationWarning] = useState<any>(null);
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  
  const { setTableNumber } = useCartStore();
  const { lang, t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/tables');
        if (response.ok) {
          const data = await response.json();
          setTables(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Masalar yüklenirken hata:', error);
        setTables([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleTableSelect = async (tableCode: string, status: string) => {
    // Önce rezervasyon kontrolü yap
    try {
      const response = await fetch('/api/reservations/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableCode })
      });
      
      const data = await response.json();
      
      if (data.reserved) {
        // Rezerve masa - uyarı göster
        setReservationWarning({
          tableCode,
          customerName: data.reservation.customerName,
          startTime: data.reservation.startTime,
          endTime: data.reservation.endTime,
          date: data.reservation.date
        });
        setShowReservationDialog(true);
        return;
      }
    } catch (error) {
      console.error('Rezervasyon kontrolü hatası:', error);
    }

    // Rezerve değilse normal akış
    if (status === 'closed') {
      setSelectedClosedTable(tableCode);
      setShowDialog(true);
    } else {
      setTableNumber(tableCode);
      router.push('/category');
    }
  };

  const confirmClosedTable = () => {
    if (selectedClosedTable) {
      setTableNumber(selectedClosedTable);
      setShowDialog(false);
      router.push('/category');
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
      </div>
    );
  }

  return (
    <div className='py-8 px-4 animate-fadeInUp'>
      {/* Header */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg'>
          <span className='text-3xl'>🪑</span>
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>{t('tableSelection')}</h1>
        <p className='text-gray-600'>{t('selectTable')}</p>
      </div>

      {/* Tables Grid */}
      {tables.length > 0 ? (
        <div className='grid gap-4 max-w-6xl mx-auto mb-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableSelect(table.code, table.status)}
              disabled={false}
              className={`group relative w-full aspect-square rounded-2xl border-2 transition-all duration-300 shadow-md flex flex-col items-center justify-center gap-1 ${
                table.status === 'open'
                  ? 'bg-white border-gray-200 hover:border-red-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                  : 'bg-red-100 border-red-400 opacity-70 cursor-pointer hover:opacity-100 transition-opacity'
              }`}
            >
              <div className={`text-4xl transition-transform ${
                table.status === 'open' ? 'group-hover:scale-105' : ''
              }`}>
                {table.status === 'open' ? '🍽️' : '🚫'}
              </div>
              <div className={`font-bold text-center ${
                table.status === 'open' ? 'text-gray-900' : 'text-red-700'
              }`}>
                {table.code}
              </div>
              <div className={`text-xs ${
                table.status === 'open' ? 'text-gray-500' : 'text-red-600'
              }`}>
                {table.status === 'open' ? t('tableEmpty') : t('tableFull')}
              </div>
              
              {/* Hover Effect - Only for open tables */}
              {table.status === 'open' && (
                <div className='absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity'></div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-600 text-lg mb-4'>{t('noTablesAvailable')}</p>
          <p className='text-gray-500 text-sm'>{t('pleaseRetryLater')}</p>
        </div>
      )}

      {/* Back Button */}
      <div className='text-center'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
          </svg>
          {t('backHome')}
        </Link>
      </div>

      {/* Reservation Warning Dialog */}
      {showReservationDialog && reservationWarning && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn'>
            <div className='flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4'>
              <span className='text-3xl'>📅</span>
            </div>
            
            <h3 className='text-center text-xl font-bold text-gray-900 mb-3'>
              {lang === 'TR' ? 'Masa Rezerve Edilmiş!' : 'Table is Reserved!'}
            </h3>
            
            <div className='bg-purple-50 rounded-xl p-4 mb-4 space-y-2'>
              <div className='flex items-center gap-2 text-sm'>
                <span className='font-semibold text-purple-800'>Masa:</span>
                <span className='text-gray-900 font-bold'>{reservationWarning.tableCode}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <span className='font-semibold text-purple-800'>Müşteri:</span>
                <span className='text-gray-900'>{reservationWarning.customerName}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <span className='font-semibold text-purple-800'>Tarih:</span>
                <span className='text-gray-900'>
                  {new Date(reservationWarning.date).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <span className='font-semibold text-purple-800'>Saat:</span>
                <span className='text-gray-900'>
                  {reservationWarning.startTime} - {reservationWarning.endTime}
                </span>
              </div>
            </div>

            <p className='text-center text-sm text-gray-600 mb-6'>
              {lang === 'TR' 
                ? 'Bu masa şu anda rezerve edilmiş durumda. Lütfen başka bir masa seçin veya personelle iletişime geçin.'
                : 'This table is currently reserved. Please select another table or contact staff.'}
            </p>
            
            <button
              onClick={() => {
                setShowReservationDialog(false);
                setReservationWarning(null);
              }}
              className='w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl'
            >
              {lang === 'TR' ? 'Anladım' : 'Understood'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog - Kapalı Masa */}
      {showDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn'>
            <div className='flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4'>
              <span className='text-2xl'>⚠️</span>
            </div>
            
            <h3 className='text-center text-lg font-bold text-gray-900 mb-3'>
              {t('areYouSure')}
            </h3>
            
            <p className='text-center text-gray-600 mb-2'>
              <span className='font-semibold text-red-600'>{selectedClosedTable}</span> {t('tableBusyWarning')}
            </p>

            <p className='text-center text-sm text-gray-500 mb-6 italic'>
              {t('firstOrderWarning').replace('"Evet, Bu masada sipariş ver"', `<span class='font-semibold text-red-600'>"${t('orderAtThisTable')}"</span>`)}
            </p>
            
            <div className='space-y-3'>
              <button
                onClick={confirmClosedTable}
                className='w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl'
              >
                ✅ {t('orderAtThisTable')}
              </button>
              
              <button
                onClick={() => setShowDialog(false)}
                className='w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-colors'
              >
                ❌ {t('selectDifferentTable')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
