'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

interface DailySale {
  date: string;
  orders: any[];
  totalSales: number;
  totalTax: number;
  totalRevenue: number;
  orderCount: number;
}

export default function AccountingPage() {
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchDailySales();
    const interval = setInterval(fetchDailySales, 30000); // 30 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  const fetchDailySales = async () => {
    try {
      const response = await fetch('/api/accounting/daily-sales', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDailySales(data);
      }
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSale = selectedDate ? dailySales.find(s => s.date === selectedDate) : null;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 w-full'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-40 w-full shadow-sm'>
        <div className='w-full max-w-screen-2xl mx-auto px-8 py-6'>
          <div className='flex items-center gap-4'>
            <Link href="/dashboard" className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <FiArrowLeft className='w-6 h-6 text-gray-600' />
            </Link>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Gün Sonu Raporu</h1>
              <p className='text-gray-600 text-sm mt-1'>Günlük satış ve gelir raporları</p>
            </div>
          </div>
        </div>
      </div>

      {/* Uyarı Mesajı */}
      <div className='w-full max-w-screen-2xl mx-auto px-8 pt-6'>
        <div className='bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3'>
          <span className='text-2xl'>⚠️</span>
          <div>
            <p className='text-red-800 font-semibold text-sm'>Otomatik Veri Temizleme</p>
            <p className='text-red-600 text-xs mt-1'>
              60 günden eski kayıtlar otomatik olarak sistemden silinecektir. Önemli verileri düzenli olarak yedekleyin.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='w-full max-w-screen-2xl mx-auto px-8 py-6'>
        {loading ? (
          <div className='text-center py-20'>
            <p className='text-gray-600'>Yükleniyor...</p>
          </div>
        ) : dailySales.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            <p className='text-gray-600 text-lg'>Henüz ödeme alınmamış</p>
            <p className='text-gray-500 text-sm mt-2'>Ödenmiş siparişler burada görünecek</p>
          </div>
        ) : (
          <div className='grid gap-6'>
            {/* Daily Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {dailySales.map(sale => (
                <div
                  key={sale.date}
                  onClick={() => setSelectedDate(sale.date === selectedDate ? null : sale.date)}
                  className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedDate === sale.date ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-bold text-gray-900'>📅 {sale.date}</h3>
                    <span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold'>
                      {sale.orderCount} sipariş
                    </span>
                  </div>
                  
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>Ara Toplam:</span>
                      <span className='font-semibold text-gray-900'>{sale.totalSales.toFixed(2)}₺</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-600 text-sm'>KDV:</span>
                      <span className='font-semibold text-gray-900'>{sale.totalTax.toFixed(2)}₺</span>
                    </div>
                    <div className='flex justify-between items-center pt-3 border-t border-gray-200'>
                      <span className='text-gray-900 font-bold'>Toplam:</span>
                      <span className='font-bold text-blue-600 text-xl'>{sale.totalRevenue.toFixed(2)}₺</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed View */}
            {selectedSale && (
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <h3 className='text-xl font-bold text-gray-900 mb-6'>
                  {selectedSale.date} - Sipariş Detayları
                </h3>
                
                <div className='space-y-4'>
                  {selectedSale.orders.map(order => (
                    <div key={order.orderId} className='border border-gray-200 rounded-lg p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-3'>
                          <span className='font-bold text-gray-900'>Masa {order.tableCode}</span>
                          <span className='text-sm text-gray-500'>
                            {new Date(order.paidAt).toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        <span className='font-bold text-blue-600'>{order.total.toFixed(2)}₺</span>
                      </div>
                      
                      <div className='space-y-1'>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className='flex justify-between text-sm text-gray-600'>
                            <span>{item.name} x{item.quantity}</span>
                            <span>{item.subtotal.toFixed(2)}₺</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
