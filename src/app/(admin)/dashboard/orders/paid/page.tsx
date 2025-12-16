'use client';

import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  tableCode: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid';
  createdAt: string;
  paidAt: string;
}

export default function PaidOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPaidOrders();
    const interval = setInterval(fetchPaidOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPaidOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const allOrders = await response.json();
        const paidOrders = allOrders.filter((o: Order) => o.status === 'paid');
        setOrders(paidOrders.sort((a: Order, b: Order) => 
          new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching paid orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tarih filtreleme fonksiyonları
  const getDateKey = (date: Date) => {
    return date.toLocaleDateString('tr-TR');
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return getDateKey(date) === getDateKey(today);
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getDateKey(date) === getDateKey(yesterday);
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    return date >= weekAgo && date <= today;
  };

  const isThisMonth = (date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  // Filtreleme mantığı
  const getFilteredOrders = () => {
    let filtered = [...orders];

    switch (filterType) {
      case 'today':
        filtered = filtered.filter(o => isToday(new Date(o.paidAt)));
        break;
      case 'yesterday':
        filtered = filtered.filter(o => isYesterday(new Date(o.paidAt)));
        break;
      case 'week':
        filtered = filtered.filter(o => isThisWeek(new Date(o.paidAt)));
        break;
      case 'month':
        filtered = filtered.filter(o => isThisMonth(new Date(o.paidAt)));
        break;
      case 'custom':
        if (filterDate) {
          filtered = filtered.filter(o => getDateKey(new Date(o.paidAt)) === filterDate);
        }
        break;
      case 'all':
      default:
        // Tüm siparişler
        break;
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Benzersiz tarihler (özel filtre için)
  const uniqueDates = Array.from(new Set(
    orders.map(o => getDateKey(new Date(o.paidAt)))
  )).sort((a, b) => {
    const dateA = a.split('.').reverse().join('-');
    const dateB = b.split('.').reverse().join('-');
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // İstatistikler
  const todayOrders = orders.filter(o => isToday(new Date(o.paidAt)));
  const yesterdayOrders = orders.filter(o => isYesterday(new Date(o.paidAt)));
  const weekOrders = orders.filter(o => isThisWeek(new Date(o.paidAt)));
  const monthOrders = orders.filter(o => isThisMonth(new Date(o.paidAt)));

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalTax = filteredOrders.reduce((sum, o) => sum + o.tax, 0);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full flex items-center justify-center'>
        <p className='text-gray-600'>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-40 w-full'>
        <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 md:gap-4 min-w-0 flex-1'>
              <Link href="/dashboard/orders" className='p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0'>
                <FiArrowLeft className='w-5 md:w-6 h-5 md:h-6 text-gray-600' />
              </Link>
              <div className='min-w-0 flex-1'>
                <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate'>💰 Ödenen Siparişler</h1>
                <p className='text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1'>Toplam {orders.length} ödenen sipariş</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-gray-200 bg-white'>
        <div className='space-y-4'>
          {/* Hızlı Filtreler */}
          <div>
            <p className='text-xs md:text-sm font-semibold text-gray-700 mb-2'>⚡ Hızlı Filtreler</p>
            <div className='flex gap-2 flex-wrap'>
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterDate(null);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all text-xs md:text-sm whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Tümü ({orders.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('today');
                  setFilterDate(null);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all text-xs md:text-sm whitespace-nowrap ${
                  filterType === 'today'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌟 Bugün ({todayOrders.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('yesterday');
                  setFilterDate(null);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all text-xs md:text-sm whitespace-nowrap ${
                  filterType === 'yesterday'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📆 Dün ({yesterdayOrders.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('week');
                  setFilterDate(null);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all text-xs md:text-sm whitespace-nowrap ${
                  filterType === 'week'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Son 7 Gün ({weekOrders.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('month');
                  setFilterDate(null);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all text-xs md:text-sm whitespace-nowrap ${
                  filterType === 'month'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Bu Ay ({monthOrders.length})
              </button>
            </div>
          </div>

          {/* Tarihe Göre Filtrele - Takvim Butonu */}
          {uniqueDates.length > 0 && (
            <div>
              <div className='flex items-center justify-between mb-3'>
                <p className='text-xs md:text-sm font-semibold text-gray-700'>📅 Özel Tarih Seç</p>
                {filterType === 'custom' && filterDate && (
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterDate(null);
                    }}
                    className='text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1'
                  >
                    <span>✕</span> Temizle
                  </button>
                )}
              </div>
              
              {/* Tarih Seç Butonu */}
              <div className='relative'>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium text-sm md:text-base flex items-center justify-center gap-2 transition-all ${
                    filterType === 'custom' && filterDate
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <span className='text-xl'>📅</span>
                  <span>
                    {filterType === 'custom' && filterDate
                      ? `Seçili: ${filterDate}`
                      : 'Tarih Seç'}
                  </span>
                  <span className={`text-xs transition-transform ${showCalendar ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {/* Takvim Dropdown */}
                {showCalendar && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className='fixed inset-0 z-40'
                      onClick={() => setShowCalendar(false)}
                    ></div>
                    
                    {/* Takvim */}
                    <div className='absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 w-full md:w-auto md:min-w-[420px] max-w-md'>
                      {/* Takvim Header - Ay/Yıl Kontrolü */}
                      <div className='flex items-center justify-between mb-4 pb-3 border-b border-gray-200'>
                        <button
                          onClick={() => {
                            if (selectedMonth === 0) {
                              setSelectedMonth(11);
                              setSelectedYear(selectedYear - 1);
                            } else {
                              setSelectedMonth(selectedMonth - 1);
                            }
                          }}
                          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                          <span className='text-xl'>◀</span>
                        </button>
                        
                        <div className='text-center'>
                          <h3 className='font-bold text-gray-900 text-lg'>
                            {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][selectedMonth]} {selectedYear}
                          </h3>
                          <button
                            onClick={() => {
                              const now = new Date();
                              setSelectedMonth(now.getMonth());
                              setSelectedYear(now.getFullYear());
                            }}
                            className='text-xs text-blue-600 hover:text-blue-700 font-medium mt-1'
                          >
                            Bugüne Dön
                          </button>
                        </div>
                        
                        <div className='flex items-center gap-1'>
                          <button
                            onClick={() => {
                              if (selectedMonth === 11) {
                                setSelectedMonth(0);
                                setSelectedYear(selectedYear + 1);
                              } else {
                                setSelectedMonth(selectedMonth + 1);
                              }
                            }}
                            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                          >
                            <span className='text-xl'>▶</span>
                          </button>
                          <button
                            onClick={() => setShowCalendar(false)}
                            className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-xl'
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Günler */}
                      <div className='grid grid-cols-7 gap-1 mb-2'>
                        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                          <div key={day} className='text-center text-xs font-semibold text-gray-600 py-2'>
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Takvim Grid */}
                      <div className='grid grid-cols-7 gap-1'>
                        {(() => {
                          const now = new Date();
                          const firstDay = new Date(selectedYear, selectedMonth, 1);
                          const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
                          const daysInMonth = lastDay.getDate();
                          
                          let startDay = firstDay.getDay();
                          startDay = startDay === 0 ? 6 : startDay - 1;

                          const calendarDays = [];
                          
                          // Boş günler
                          for (let i = 0; i < startDay; i++) {
                            calendarDays.push(
                              <div key={`empty-${i}`} className='aspect-square'></div>
                            );
                          }

                          // Ayın günleri
                          for (let day = 1; day <= daysInMonth; day++) {
                            const currentDate = new Date(selectedYear, selectedMonth, day);
                            const dateKey = getDateKey(currentDate);
                            const dateOrders = orders.filter(o => getDateKey(new Date(o.paidAt)) === dateKey);
                            const hasOrders = dateOrders.length > 0;
                            const isActive = filterType === 'custom' && filterDate === dateKey;
                            const isToday = getDateKey(now) === dateKey;

                            calendarDays.push(
                              <button
                                key={day}
                                onClick={() => {
                                  if (hasOrders) {
                                    setFilterType('custom');
                                    setFilterDate(dateKey);
                                    setShowCalendar(false);
                                  }
                                }}
                                disabled={!hasOrders}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                                  isActive
                                    ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-400'
                                    : hasOrders
                                    ? isToday
                                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                                      : 'bg-gray-100 text-gray-900 hover:bg-blue-100 hover:text-blue-700 border border-gray-300'
                                    : 'bg-transparent text-gray-300 cursor-not-allowed'
                                }`}
                                title={hasOrders ? `${dateOrders.length} sipariş` : 'Sipariş yok'}
                              >
                                <span className='text-sm font-bold'>{day}</span>
                                {hasOrders && (
                                  <span className={`text-[9px] mt-0.5 ${
                                    isActive ? 'text-blue-100' : isToday ? 'text-green-100' : 'text-gray-500'
                                  }`}>
                                    {dateOrders.length}
                                  </span>
                                )}
                              </button>
                            );
                          }

                          return calendarDays;
                        })()}
                      </div>

                      {/* Açıklama */}
                      <div className='flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs'>
                        <div className='flex items-center gap-1.5'>
                          <div className='w-4 h-4 rounded bg-green-500'></div>
                          <span className='text-gray-600'>Bugün</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <div className='w-4 h-4 rounded bg-blue-600'></div>
                          <span className='text-gray-600'>Seçili</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <div className='w-4 h-4 rounded bg-gray-100 border border-gray-300'></div>
                          <span className='text-gray-600'>Sipariş var</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uyarı Mesajı */}
      <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 pt-4 md:pt-6'>
        <div className='bg-red-50 border-2 border-red-200 rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3'>
          <span className='text-xl md:text-2xl flex-shrink-0'>⚠️</span>
          <div className='min-w-0 flex-1'>
            <p className='text-red-800 font-semibold text-xs md:text-sm'>Otomatik Veri Temizleme</p>
            <p className='text-red-600 text-[10px] md:text-xs mt-1'>
              60 günden eski ödeme kayıtları otomatik olarak sistemden silinecektir. Önemli verileri düzenli olarak yedekleyin.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4'>
            <div className='bg-white rounded-lg border-2 border-gray-200 p-4 md:p-5 hover:shadow-lg transition-shadow'>
              <p className='text-gray-600 text-xs md:text-sm font-medium'>Sipariş Sayısı</p>
              <p className='text-xl md:text-2xl font-bold text-gray-900 mt-1'>{filteredOrders.length}</p>
            </div>
            <div className='bg-white rounded-lg border-2 border-gray-200 p-4 md:p-5 hover:shadow-lg transition-shadow'>
              <p className='text-gray-600 text-xs md:text-sm font-medium'>KDV (Vergi)</p>
              <p className='text-xl md:text-2xl font-bold text-gray-900 mt-1'>{totalTax.toFixed(2)}₺</p>
            </div>
            <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 md:p-5 text-white shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1'>
              <p className='text-green-100 text-xs md:text-sm font-medium'>Toplam Gelir</p>
              <p className='text-xl md:text-2xl font-bold mt-1'>{totalRevenue.toFixed(2)}₺</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 pb-8 md:pb-12'>
        <div className='space-y-3 md:space-y-4'>
          {filteredOrders.length === 0 ? (
            <div className='text-center py-8 md:py-12 bg-white rounded-lg md:rounded-xl border-2 border-dashed border-gray-300'>
              <div className='w-16 md:w-20 h-16 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl md:text-4xl'>💰</span>
              </div>
              <p className='text-gray-600 text-sm md:text-base'>Bu tarihe ait ödenen sipariş yok</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className='rounded-lg md:rounded-xl border-2 border-green-300 bg-green-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden'
              >
                <div className='bg-white border-b border-gray-200 p-4 md:p-6'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 md:gap-3 mb-2 flex-wrap'>
                        <h3 className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>Masa {order.tableCode}</h3>
                        <span className='px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800 whitespace-nowrap'>
                          ✅ Ödendi
                        </span>
                      </div>
                      <div className='flex flex-col sm:flex-row sm:gap-4 text-xs md:text-sm text-gray-600 space-y-1 sm:space-y-0'>
                        <p className='whitespace-nowrap'>📝 Sipariş: {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className='whitespace-nowrap'>💳 Ödeme: {new Date(order.paidAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className='text-left md:text-right'>
                      <p className='text-xs md:text-sm text-gray-600 font-medium'>Ödeme Tutarı</p>
                      <p className='text-2xl md:text-3xl font-bold text-green-600'>{order.total.toFixed(2)}₺</p>
                    </div>
                  </div>
                </div>

                <div className='p-4 md:p-6 bg-white/50'>
                  <div className='space-y-1.5 md:space-y-2 mb-3 md:mb-4'>
                    {order.items.map(item => (
                      <div key={item.id} className='flex justify-between items-center text-xs md:text-sm gap-2'>
                        <span className='text-gray-700 flex-1 min-w-0 truncate'>
                          {item.name} x {item.quantity}
                        </span>
                        <span className='font-semibold text-gray-900 whitespace-nowrap'>{item.subtotal.toFixed(2)}₺</span>
                      </div>
                    ))}
                  </div>

                  <div className='border-t border-gray-300 pt-3 md:pt-4 space-y-1.5 md:space-y-2'>
                    <div className='flex justify-between text-gray-700 text-xs md:text-sm'>
                      <span>Ara Toplam:</span>
                      <span>{order.subtotal.toFixed(2)}₺</span>
                    </div>
                    <div className='flex justify-between text-gray-700 text-xs md:text-sm'>
                      <span>KDV (%10):</span>
                      <span>{order.tax.toFixed(2)}₺</span>
                    </div>
                    <div className='flex justify-between text-base md:text-lg font-bold text-gray-900'>
                      <span>Toplam:</span>
                      <span className='text-green-600'>{order.total.toFixed(2)}₺</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
