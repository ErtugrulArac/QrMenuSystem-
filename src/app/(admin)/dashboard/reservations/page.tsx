'use client';

import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiPhone, FiPlus, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Reservation {
  id: string;
  tableCode: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  date: string;
  note?: string;
  createdAt: string;
}

interface Table {
  id: string;
  code: string;
  status: 'open' | 'closed';
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tableCode: '',
    customerName: '',
    customerPhone: '',
    date: '',
    startTime: '',
    endTime: '',
    note: ''
  });

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Rezervasyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tableCode || !formData.customerName || !formData.customerPhone || 
        !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('Bitiş saati başlangıç saatinden sonra olmalı');
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Rezervasyon oluşturuldu!');
        setShowForm(false);
        setFormData({
          tableCode: '',
          customerName: '',
          customerPhone: '',
          date: '',
          startTime: '',
          endTime: '',
          note: ''
        });
        fetchReservations();
      } else {
        toast.error('Rezervasyon oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Rezervasyon silindi');
        fetchReservations();
      } else {
        toast.error('Rezervasyon silinemedi');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const isReservationActive = (reservation: Reservation) => {
    const now = new Date();
    const resDate = new Date(reservation.date);
    const resStart = new Date(`${reservation.date}T${reservation.startTime}`);
    const resEnd = new Date(`${reservation.date}T${reservation.endTime}`);
    
    return now >= resStart && now <= resEnd;
  };

  const isReservationUpcoming = (reservation: Reservation) => {
    const now = new Date();
    const resStart = new Date(`${reservation.date}T${reservation.startTime}`);
    
    return now < resStart;
  };

  const sortedReservations = [...reservations].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateB.getTime() - dateA.getTime();
  });

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
              <Link href="/dashboard" className='p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0'>
                <FiArrowLeft className='w-5 md:w-6 h-5 md:h-6 text-gray-600' />
              </Link>
              <div className='min-w-0 flex-1'>
                <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate'>📅 Rezervasyonlar</h1>
                <p className='text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1'>Masa rezervasyon yönetimi</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className='px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm md:text-base'
            >
              <FiPlus className='w-4 h-4 md:w-5 md:h-5' />
              <span className='hidden sm:inline'>Yeni Rezervasyon</span>
              <span className='sm:hidden'>Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8'>
        {/* Form */}
        {showForm && (
          <div className='bg-white rounded-xl border-2 border-gray-200 p-4 md:p-6 mb-6 md:mb-8'>
            <h2 className='text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6'>Yeni Rezervasyon</h2>
            <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Masa *
                </label>
                <select
                  value={formData.tableCode}
                  onChange={(e) => setFormData({ ...formData, tableCode: e.target.value })}
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                  required
                >
                  <option value="">Masa seçin</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.code}>
                      {table.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tarih *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Başlangıç Saati *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Bitiş Saati *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Müşteri Adı *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'
                  placeholder="0555 123 45 67"
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Not (Opsiyonel)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none'
                  rows={3}
                  placeholder="Özel istekler, notlar..."
                />
              </div>

              <div className='md:col-span-2 flex gap-3'>
                <button
                  type="submit"
                  className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors'
                >
                  Rezervasyon Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors'
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reservations List */}
        {sortedReservations.length === 0 ? (
          <div className='text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300'>
            <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-4xl'>📅</span>
            </div>
            <p className='text-gray-600 text-base'>Henüz rezervasyon yok</p>
            <p className='text-gray-500 text-sm mt-2'>Yeni rezervasyon oluşturmak için yukarıdaki butona tıklayın</p>
          </div>
        ) : (
          <div className='grid gap-4'>
            {sortedReservations.map(reservation => {
              const isActive = isReservationActive(reservation);
              const isUpcoming = isReservationUpcoming(reservation);
              const isPast = !isActive && !isUpcoming;

              return (
                <div
                  key={reservation.id}
                  className={`bg-white rounded-xl border-2 p-4 md:p-6 transition-all ${
                    isActive
                      ? 'border-green-400 bg-green-50'
                      : isUpcoming
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-3 mb-3'>
                        <span className='text-2xl md:text-3xl font-bold text-gray-900'>
                          {reservation.tableCode}
                        </span>
                        {isActive && (
                          <span className='px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full'>
                            AKTİF
                          </span>
                        )}
                        {isUpcoming && (
                          <span className='px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full'>
                            YAKLAŞAN
                          </span>
                        )}
                        {isPast && (
                          <span className='px-3 py-1 bg-gray-400 text-white text-xs font-bold rounded-full'>
                            GEÇMİŞ
                          </span>
                        )}
                      </div>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <div className='flex items-center gap-2 text-gray-700'>
                          <FiUser className='w-4 h-4 flex-shrink-0' />
                          <span className='text-sm font-medium truncate'>{reservation.customerName}</span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-700'>
                          <FiPhone className='w-4 h-4 flex-shrink-0' />
                          <span className='text-sm font-medium'>{reservation.customerPhone}</span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-700'>
                          <FiCalendar className='w-4 h-4 flex-shrink-0' />
                          <span className='text-sm font-medium'>
                            {new Date(reservation.date).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-700'>
                          <FiClock className='w-4 h-4 flex-shrink-0' />
                          <span className='text-sm font-medium'>
                            {reservation.startTime} - {reservation.endTime}
                          </span>
                        </div>
                      </div>

                      {reservation.note && (
                        <div className='mt-3 pt-3 border-t border-gray-200'>
                          <p className='text-sm text-gray-600'>
                            <span className='font-medium'>Not:</span> {reservation.note}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(reservation.id)}
                      className='flex-shrink-0 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
                      title="Rezervasyonu Sil"
                    >
                      <FiTrash2 className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
