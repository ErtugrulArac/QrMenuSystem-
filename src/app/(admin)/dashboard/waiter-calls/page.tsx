'use client';

import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface WaiterCall {
  id: string;
  tableCode: string;
  calledAt: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export default function WaiterCallsManagement() {
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [waiterSystemEnabled, setWaiterSystemEnabled] = useState(true);
  const [soundNotificationEnabled, setSoundNotificationEnabled] = useState(true);

  // localStorage'dan state yükle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWaiterSystem = localStorage.getItem('waiterSystemEnabled');
      const savedSoundNotification = localStorage.getItem('soundNotificationEnabled');
      
      if (savedWaiterSystem !== null) {
        setWaiterSystemEnabled(JSON.parse(savedWaiterSystem));
      }
      if (savedSoundNotification !== null) {
        setSoundNotificationEnabled(JSON.parse(savedSoundNotification));
      }
    }
  }, []);

  // State değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('waiterSystemEnabled', JSON.stringify(waiterSystemEnabled));
    }
  }, [waiterSystemEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundNotificationEnabled', JSON.stringify(soundNotificationEnabled));
    }
  }, [soundNotificationEnabled]);

  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 5000); // Her 5 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/waiter-calls', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalls(data);
      }
    } catch (error) {
      console.error('Error fetching waiter calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeCall = async (id: string) => {
    try {
      const response = await fetch(`/api/waiter-calls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (response.ok) {
        setCalls(calls.filter(c => c.id !== id));
        toast.success('Çağrı tamamlandı!');
      }
    } catch (error) {
      console.error('Error completing call:', error);
      toast.error('Hata oluştu!');
    }
  };

  const pendingCalls = calls.filter(c => c.status === 'pending');

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
          <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4'>
            <div className='flex items-center gap-2 md:gap-4 min-w-0 flex-1 w-full'>
              <Link href="/dashboard" className='p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0'>
                <FiArrowLeft className='w-5 md:w-6 h-5 md:h-6 text-gray-600' />
              </Link>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2 md:gap-3 flex-wrap'>
                  <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900'>Garson Çağrıları</h1>
                  {pendingCalls.length > 0 && (
                    <span className='flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold animate-pulse whitespace-nowrap'>
                      <FiBell className='w-3 md:w-4 h-3 md:h-4' />
                      {pendingCalls.length} bekliyor
                    </span>
                  )}
                </div>
                <p className='text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1'>Toplam {calls.length} çağrı</p>
              </div>
            </div>
            
            {/* Sistem ve Ses Toggleleri */}
            <div className='flex items-center gap-2 md:gap-3 w-full lg:w-auto'>
              {/* Garson Sistemi Toggle */}
              <label className='flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg md:rounded-xl border-2 border-yellow-300 shadow-md hover:shadow-lg hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 cursor-pointer flex-1 lg:flex-initial'>
                <span className='text-xs md:text-sm font-bold text-yellow-900'>Sistem</span>
                <div className='relative inline-block w-10 md:w-12 h-6 md:h-7'>
                  <input
                    type='checkbox'
                    checked={waiterSystemEnabled}
                    onChange={(e) => setWaiterSystemEnabled(e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className={`w-full h-full rounded-full transition-all duration-300 ${waiterSystemEnabled ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-300 to-red-400'}`}></div>
                  <div className={`absolute left-1 top-1 w-4 md:w-5 h-4 md:h-5 bg-white rounded-full shadow-md transition-all duration-300 ${waiterSystemEnabled ? 'translate-x-4 md:translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className='text-xs font-bold text-yellow-900 hidden sm:inline'>{waiterSystemEnabled ? '✓ Aktif' : '✗ Pasif'}</span>
              </label>
              
              {/* Sesli Uyarı Toggle */}
              <label className='flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg md:rounded-xl border-2 border-orange-300 shadow-md hover:shadow-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-300 cursor-pointer flex-1 lg:flex-initial'>
                <span className='text-xs md:text-sm font-bold text-orange-900'>Ses</span>
                <div className='relative inline-block w-10 md:w-12 h-6 md:h-7'>
                  <input
                    type='checkbox'
                    checked={soundNotificationEnabled}
                    onChange={(e) => setSoundNotificationEnabled(e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className={`w-full h-full rounded-full transition-all duration-300 ${soundNotificationEnabled ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}></div>
                  <div className={`absolute left-1 top-1 w-4 md:w-5 h-4 md:h-5 bg-white rounded-full shadow-md transition-all duration-300 ${soundNotificationEnabled ? 'translate-x-4 md:translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className='text-xs font-bold text-orange-900 hidden sm:inline'>{soundNotificationEnabled ? '🔊 Açık' : '🔇 Kapalı'}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Calls List */}
      <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12'>
        <div className='space-y-3 md:space-y-4'>
          {pendingCalls.length === 0 ? (
            <div className='text-center py-8 md:py-12 bg-white rounded-lg md:rounded-xl border border-gray-200'>
              <FiBell className='w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4' />
              <p className='text-gray-600 text-base md:text-lg'>Bekleyen garson çağrısı yok</p>
              <p className='text-gray-500 text-xs md:text-sm mt-2'>Yeni çağrılar burada görünecek</p>
            </div>
          ) : (
            pendingCalls.map(call => (
              <div
                key={call.id}
                className='bg-yellow-50 border-2 border-yellow-300 rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all'
              >
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 md:gap-3 mb-2 flex-wrap'>
                      <FiBell className='w-5 md:w-6 h-5 md:h-6 text-yellow-600 animate-bounce flex-shrink-0' />
                      <h3 className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>Masa {call.tableCode}</h3>
                      <span className='px-2 md:px-3 py-0.5 md:py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold whitespace-nowrap'>
                        🔔 Garson Bekliyor
                      </span>
                    </div>
                    <p className='text-gray-600 text-xs md:text-sm'>
                      Çağrı Zamanı: {new Date(call.calledAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => completeCall(call.id)}
                    className='flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg text-sm md:text-base w-full md:w-auto'
                  >
                    <FiCheck className='w-4 md:w-5 h-4 md:h-5' />
                    <span>Tamamlandı</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
