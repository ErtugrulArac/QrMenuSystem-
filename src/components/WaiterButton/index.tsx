'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { FiBell } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function WaiterButton() {
  const tableNumber = useCartStore((state) => state.tableNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [waiterSystemEnabled, setWaiterSystemEnabled] = useState(true);

  // localStorage'dan sistem durumunu oku
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWaiterSystem = localStorage.getItem('waiterSystemEnabled');
      if (savedWaiterSystem !== null) {
        setWaiterSystemEnabled(JSON.parse(savedWaiterSystem));
      }
      
      // localStorage değiştiğini dinle (diğer sekmeler arası iletişim)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'waiterSystemEnabled' && e.newValue) {
          setWaiterSystemEnabled(JSON.parse(e.newValue));
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const callWaiter = async () => {
    console.log('🔔 Garson butonuna basıldı. Masa:', tableNumber);
    
    if (!tableNumber) {
      console.warn('⚠️ Masa numarası yok');
      toast.warning('Lütfen masanızı seçiniz! 🪑', {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        tableCode: tableNumber,
        calledAt: new Date().toISOString()
      };
      
      console.log('📤 API\'ye gönderiliyor:', payload);
      
      const response = await fetch('/api/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Garson çağrısı başarılı:', data);
        toast.success('Garson çağrıldı! ✅', {
          position: 'top-center',
          autoClose: 3000,
        });
      } else {
        const error = await response.text();
        console.error('❌ API Hatası:', response.status, error);
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Garson çağrılırken hata:', error);
      toast.error('Garson çağrılırken hata oluştu!', {
        position: 'top-center',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sistem kapalıysa gizle (mesa numarası kontrolü kaldırıldı)
  if (!waiterSystemEnabled) return null;

  return (
    <div style={{ position: 'fixed', bottom: '5.5rem', right: '1rem', zIndex: 9999 }} className='flex flex-col items-center'>
      <button
        onClick={callWaiter}
        disabled={isLoading}
        className='bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3 rounded-full shadow-2xl hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
        aria-label='Garson Çağır'
      >
        <FiBell className={`w-7 h-7 ${isLoading ? 'animate-bounce' : ''}`} />
      </button>
      <span className='text-[10px] text-gray-700 font-semibold mt-1 whitespace-nowrap'>Garson</span>
    </div>
  );
}
