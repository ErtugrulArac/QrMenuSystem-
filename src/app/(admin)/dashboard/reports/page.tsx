'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiTrendingUp, FiBarChart2, FiPieChart, FiCalendar, FiDownload } from 'react-icons/fi';

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const salesData = {
    daily: [
      { day: 'Pzt', revenue: 8500, orders: 32 },
      { day: 'Sal', revenue: 9200, orders: 38 },
      { day: 'Çar', revenue: 11300, orders: 45 },
      { day: 'Per', revenue: 10800, orders: 42 },
      { day: 'Cum', revenue: 15600, orders: 58 },
      { day: 'Cmt', revenue: 18900, orders: 67 },
      { day: 'Paz', revenue: 16400, orders: 61 }
    ],
    weekly: [
      { week: '1. Hafta', revenue: 45200, orders: 178 },
      { week: '2. Hafta', revenue: 52800, orders: 205 },
      { week: '3. Hafta', revenue: 48900, orders: 192 },
      { week: '4. Hafta', revenue: 61500, orders: 238 }
    ],
    monthly: [
      { month: 'Ocak', revenue: 198400, orders: 756 },
      { month: 'Şubat', revenue: 215600, orders: 823 },
      { month: 'Mart', revenue: 248900, orders: 945 },
      { month: 'Nisan', revenue: 287650, orders: 1098 }
    ]
  };

  const categoryStats = [
    { name: 'Atıştırmalıklar', revenue: 45200, percentage: 18.5, color: 'from-red-500 to-red-600' },
    { name: 'Ana Yemekler', revenue: 98600, percentage: 40.3, color: 'from-orange-500 to-orange-600' },
    { name: 'Tatlılar', revenue: 32400, percentage: 13.2, color: 'from-pink-500 to-pink-600' },
    { name: 'İçecekler', revenue: 68450, percentage: 28.0, color: 'from-blue-500 to-blue-600' }
  ];

  const hourlyStats = [
    { hour: '08:00', orders: 5 },
    { hour: '09:00', orders: 8 },
    { hour: '10:00', orders: 12 },
    { hour: '11:00', orders: 18 },
    { hour: '12:00', orders: 35 },
    { hour: '13:00', orders: 42 },
    { hour: '14:00', orders: 28 },
    { hour: '15:00', orders: 15 },
    { hour: '16:00', orders: 12 },
    { hour: '17:00', orders: 18 },
    { hour: '18:00', orders: 32 },
    { hour: '19:00', orders: 45 },
    { hour: '20:00', orders: 52 },
    { hour: '21:00', orders: 38 },
    { hour: '22:00', orders: 22 }
  ];

  const maxOrders = Math.max(...hourlyStats.map(h => h.orders));

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 w-full'>
      {/* Header */}
      <div className='bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 w-full shadow-sm'>
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between'>
            <div className='flex items-center gap-4'>
              <Link href="/dashboard" className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                <FiArrowLeft className='w-6 h-6 text-gray-600' />
              </Link>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Raporlar & İstatistikler</h1>
                <p className='text-gray-600 text-sm mt-0.5'>Detaylı satış analizleri</p>
              </div>
            </div>
            <button className='flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md'>
              <FiDownload className='w-4 h-4' />
              <span>Raporu İndir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Period Selector */}
        <div className='bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-md'>
          <div className='flex flex-wrap gap-3'>
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'daily' && 'Günlük'}
                {p === 'weekly' && 'Haftalık'}
                {p === 'monthly' && 'Aylık'}
              </button>
            ))}
          </div>
        </div>

        {/* Sales Chart */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-md'>
          <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
            <FiBarChart2 className='w-5 h-5 text-indigo-600' />
            Satış Grafiği
          </h3>
          <div className='grid grid-cols-7 gap-2 sm:gap-4 mb-4'>
            {period === 'daily' && salesData.daily.map((item, index) => {
              const maxRevenue = Math.max(...salesData.daily.map(d => d.revenue));
              const height = (item.revenue / maxRevenue) * 200;
              return (
                <div key={index} className='flex flex-col items-center gap-2'>
                  <div className='text-xs sm:text-sm font-bold text-gray-900'>₺{(item.revenue / 1000).toFixed(1)}k</div>
                  <div
                    className='w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-600 hover:to-indigo-500 cursor-pointer'
                    style={{ height: `${height}px` }}
                    title={`${item.revenue} ₺`}
                  ></div>
                  <div className='text-xs font-semibold text-gray-600'>{item.day}</div>
                  <div className='text-xs text-gray-500'>{item.orders} sip.</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Stats & Hourly Distribution */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Category Stats */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
            <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
              <FiPieChart className='w-5 h-5 text-orange-600' />
              Kategori Bazlı Satışlar
            </h3>
            <div className='space-y-4'>
              {categoryStats.map((cat, index) => (
                <div key={index}>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='font-semibold text-gray-900 text-sm'>{cat.name}</span>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm font-bold text-gray-600'>₺{cat.revenue.toLocaleString()}</span>
                      <span className='text-sm text-gray-500'>{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className='w-full h-3 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Distribution */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-md'>
            <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
              <FiCalendar className='w-5 h-5 text-blue-600' />
              Saatlik Sipariş Dağılımı
            </h3>
            <div className='space-y-2 max-h-80 overflow-y-auto'>
              {hourlyStats.map((stat, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <span className='text-sm font-semibold text-gray-600 w-16'>{stat.hour}</span>
                  <div className='flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center px-3 transition-all duration-300'
                      style={{ width: `${(stat.orders / maxOrders) * 100}%` }}
                    >
                      {stat.orders > 5 && (
                        <span className='text-white text-xs font-bold'>{stat.orders}</span>
                      )}
                    </div>
                  </div>
                  {stat.orders <= 5 && (
                    <span className='text-sm text-gray-600 w-8'>{stat.orders}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-xl'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                <FiTrendingUp className='w-6 h-6' />
              </div>
              <span className='text-sm bg-white/20 px-2 py-1 rounded'>Bu Ay</span>
            </div>
            <h3 className='text-3xl font-bold mb-1'>+12.5%</h3>
            <p className='text-green-100 text-sm'>Büyüme Oranı</p>
          </div>

          <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-xl'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                <span className='text-2xl'>👥</span>
              </div>
              <span className='text-sm bg-white/20 px-2 py-1 rounded'>Ortalama</span>
            </div>
            <h3 className='text-3xl font-bold mb-1'>142</h3>
            <p className='text-purple-100 text-sm'>Günlük Müşteri</p>
          </div>

          <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-xl'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                <span className='text-2xl'>⭐</span>
              </div>
              <span className='text-sm bg-white/20 px-2 py-1 rounded'>En Popüler</span>
            </div>
            <h3 className='text-xl font-bold mb-1'>Ana Yemekler</h3>
            <p className='text-orange-100 text-sm'>%40.3 Oran</p>
          </div>

          <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-xl'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center'>
                <span className='text-2xl'>🕐</span>
              </div>
              <span className='text-sm bg-white/20 px-2 py-1 rounded'>Yoğun Saat</span>
            </div>
            <h3 className='text-3xl font-bold mb-1'>20:00</h3>
            <p className='text-blue-100 text-sm'>52 Sipariş</p>
          </div>
        </div>

        {/* Info */}
        <div className='mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4'>
          <div className='flex items-start gap-3'>
            <div className='w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0'>
              <span className='text-xl'>📊</span>
            </div>
            <div>
              <h4 className='font-bold text-gray-900 mb-1'>Detaylı Analiz</h4>
              <p className='text-gray-600 text-sm'>
                Raporlar günlük olarak güncellenir. Daha detaylı analiz için özel tarih aralığı seçebilir ve Excel formatında indirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
