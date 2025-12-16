'use client';

import Link from 'next/link';
import { FiUsers, FiClipboard, FiList, FiShoppingCart, FiLogOut, FiDollarSign, FiTrendingUp, FiBell } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface WaiterCall {
  id: string;
  tableCode: string;
  calledAt: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

// Global AudioContext
let globalAudioContext: any = null;

export default function AdminDashboard() {
  const [pendingCalls, setPendingCalls] = useState<WaiterCall[]>([]);
  const [lastCallCount, setLastCallCount] = useState(0);
  const [waiterSystemEnabled, setWaiterSystemEnabled] = useState(true);
  const [soundNotificationEnabled, setSoundNotificationEnabled] = useState(true);
  const [tables, setTables] = useState<any[]>([]);
  const audioContextRef = useRef<any>(null);

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


  // Tüm helper fonksiyonları önceden tanımla
  const playBeepSound = useCallback(async () => {
    try {
      console.log('🔊 playBeepSound çalıştırılıyor...');
      
      // Global AudioContext'i kullan, yoksa oluştur
      if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('🆕 Yeni AudioContext oluşturuldu');
      }
      
      const audioContext = globalAudioContext;
      console.log('✓ AudioContext state:', audioContext.state);
      
      // Resume et (gerekirse) - await ile bekleme yapılacak
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
          console.log('✓ AudioContext resumed');
        } catch (e) {
          console.error('Resume error:', e);
        }
      }
      
      const now = audioContext.currentTime;
      
      // Birden fazla frekansta ses (daha belirgin olacak)
      [800, 1000, 1200].forEach((freq, index) => {
        try {
          const osc = audioContext.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          // Master gain - daha yüksek ses
          const gain = audioContext.createGain();
          // Başında volume (0.8), sonunda fade out
          gain.gain.setValueAtTime(0.8, now + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.8);
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.start(now + index * 0.1);
          osc.stop(now + index * 0.1 + 0.8);
          
          console.log(`✓ Oscillator ${index}:`, freq, 'Hz');
        } catch (e) {
          console.error(`❌ Oscillator ${index} error:`, e);
        }
      });
      
      console.log('✅ Çok tonlu ses oynatıldı! (800Hz, 1000Hz, 1200Hz)');
    } catch (e) {
      console.error('❌ HATA - playBeepSound:', e);
    }
  }, []);

  const speakCallAnnouncement = useCallback(async (tableCode: string) => {
    if (!waiterSystemEnabled) return;
    
    try {
      // Önce basit ses tonuyla uyar (Web Audio API) - ses açık ise
      if (soundNotificationEnabled) {
        await playBeepSound();
      }
      
      // Sonra metin okuma (TTS) dene - ses açık ise
      if (soundNotificationEnabled && 'speechSynthesis' in window) {
        // Masa numarasını Türkçeye çevir ve sistemde kayıtlı masayı bul
        const numberMap: { [key: string]: string } = {
          '1': 'bir', '2': 'iki', '3': 'üç', '4': 'dört', '5': 'beş',
          '6': 'altı', '7': 'yedi', '8': 'sekiz', '9': 'dokuz', '0': 'sıfır'
        };
        
        let cleanTable = tableCode.replace(/[^\d]/g, '');
        let turkishNumber = cleanTable
          .split('')
          .map((digit: string) => numberMap[digit] || digit)
          .join(' ');
        
        // Sistemde kayıtlı masa ismini bul
        const registeredTable = tables.find(
          (t: any) => t.tableNumber?.toString() === cleanTable || t.name === tableCode
        );
        const tableName = registeredTable?.name || `Masa ${turkishNumber}`;
        
        const message = `${tableName} masasından garson çağrısı`;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.95;
        utterance.pitch = 1.6;
        utterance.volume = 0.6;
        
        // Kadın sesi seç
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(
          (voice) => voice.lang.startsWith('tr') && voice.name.toLowerCase().includes('female')
        ) || voices.find((voice) => voice.lang.startsWith('tr')) || voices[0];
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          console.log('🎤 Ses:', femaleVoice.name);
        }
        
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
        
        console.log('🔊 Sesli uyarı:', message);
      } else if (!soundNotificationEnabled) {
        console.log('🔇 Sesli uyarı kapalı, sadece çağrı işaretlendi');
      } else {
        console.warn('🔴 Speech Synthesis API desteklenmiyor');
      }
    } catch (e) {
      console.error('Speech error:', e);
    }
  }, [waiterSystemEnabled, soundNotificationEnabled, tables, playBeepSound]);

  const fetchWaiterCalls = useCallback(async () => {
    if (!waiterSystemEnabled) return;
    
    try {
      const response = await fetch('/api/waiter-calls', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const pending = data.filter((call: WaiterCall) => call.status === 'pending');
        
        console.log('📞 Pending calls fetched:', pending.length);
        
        setPendingCalls((prevCalls) => {
          // Yeni çağrıları tespit et
          const newCalls = pending.filter(
            (p: WaiterCall) => !prevCalls.some((existing: WaiterCall) => existing.id === p.id)
          );
          
          // Eğer yeni çağrı varsa ses çal
          if (newCalls.length > 0) {
            console.log('🔔 YENİ ÇAĞRI TESPİT EDİLDİ! Ses oynatılıyor...');
            newCalls.forEach((call: WaiterCall) => {
              console.log('📢 Çağrı:', call.tableCode);
              // await ile çağrı yapmalıyız
              speakCallAnnouncement(call.tableCode);
            });
          }
          
          return pending;
        });
        
        setLastCallCount(pending.length);
      }
    } catch (error) {
      console.error('Error fetching waiter calls:', error);
    }
  }, [waiterSystemEnabled, speakCallAnnouncement]);

  // Polling interval
  useEffect(() => {
    if (!waiterSystemEnabled) return;
    
    fetchWaiterCalls();
    const interval = setInterval(fetchWaiterCalls, 3000);
    return () => clearInterval(interval);
  }, [waiterSystemEnabled, fetchWaiterCalls]);

  // AudioContext'i ilk tıklamada inizyalize et
  const initAudioContext = useCallback(() => {
    try {
      if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = globalAudioContext;
      }
      if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
      }
      console.log('✓ AudioContext initialized, state:', globalAudioContext.state);
    } catch (e) {
      console.error('Audio init error:', e);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', initAudioContext, { once: true });
    return () => document.removeEventListener('click', initAudioContext);
  }, [initAudioContext]);

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch('/api/tables', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        setTables(data);
        console.log('📋 Masalar yüklendi:', data.length);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  }, []);

  // Masaları sistem açık olduğunda yükle
  useEffect(() => {
    if (!waiterSystemEnabled) return;
    fetchTables();
  }, [waiterSystemEnabled, fetchTables]);

  const playNotificationSound = useCallback(() => {
    try {
      playBeepSound();
      console.log('🔔 Bildirim sesi oynatıldı');
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [playBeepSound]);

  const menuItems = [
    {
      title: 'Masa Yönetimi',
      emoji: '🪑',
      href: '/dashboard/tables',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Siparişler',
      emoji: '📋',
      href: '/dashboard/orders',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Kategoriler',
      emoji: '📂',
      href: '/dashboard/category',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Ürünler',
      emoji: '🍔',
      href: '/dashboard/product',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Muhasebe',
      emoji: '💰',
      href: '/dashboard/accounting',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Kampanyalar',
      emoji: '📢',
      href: '/dashboard/campaigns',
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Garson Çağrıları',
      emoji: '🔔',
      href: '/dashboard/waiter-calls',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Ödenen Siparişler',
      emoji: '✅',
      href: '/dashboard/orders/paid',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Rezervasyonlar',
      emoji: '📅',
      href: '/dashboard/reservations',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Raporlar',
      emoji: '📊',
      href: '/dashboard/reports',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 w-full'>
      {/* Header */}
      <div className='bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 w-full shadow-sm'>
        <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                  <span className='text-2xl'>🍽️</span>
                </div>
                <div>
                  <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight'>Arlan Admin Paneli</h1>
                  <p className='text-gray-600 text-sm mt-0.5'>Restoran Yönetim Paneli </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              {/* Garson Çağrıları Badge */}
              <Link
                href='/dashboard/waiter-calls'
                className='relative px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2'
              >
                <FiBell className={`w-5 h-5 ${pendingCalls.length > 0 ? 'animate-bounce' : ''}`} />
                <span>{pendingCalls.length > 0 ? `${pendingCalls.length} Çağrı` : 'Çağrı Yok'}</span>
                {pendingCalls.length > 0 && (
                  <span className='absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse'>
                    {pendingCalls.length}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => signOut()}
                className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium'
              >
                <FiLogOut className='w-5 h-5' />
                <span className='hidden sm:inline'>Çıkış Yap</span>
                <span className='sm:hidden'>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        {/* Welcome Card */}
        <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-xl'>
          <h2 className='text-2xl sm:text-3xl font-bold mb-2'>Hoş Geldiniz! 👋</h2>
          <p className='text-blue-100 text-sm sm:text-base'>Menü yönetimi, sipariş takibi ve masa kontrolü için hazır.</p>
        </div>

        {/* Grid */}
        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className='group'
            >
              <div className={`relative aspect-square bg-gradient-to-br ${item.color} rounded-3xl p-8 border-2 border-transparent hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 overflow-hidden flex flex-col items-center justify-center`}>
                {/* Overlay */}
                <div className='absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl'></div>
                
                <div className='relative flex flex-col items-center justify-center h-full w-full'>
                  {/* Emoji */}
                  <div className='text-6xl md:text-7xl mb-4 group-hover:scale-110 transition-transform duration-300'>
                    {item.emoji}
                  </div>
                  
                  {/* Title */}
                  <h3 className='text-lg md:text-xl font-bold text-white text-center line-clamp-2'>
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Boxes */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
          <div className='bg-white border border-blue-200 rounded-2xl p-6 shadow-md'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                <span className='text-2xl'>💡</span>
              </div>
              <div className='flex-1'>
                <h4 className='font-bold text-gray-900 mb-2 text-lg'>Hızlı İpucu</h4>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  Kategorileri ve ürünleri ekledikten sonra, müşteriler QR menüden sipariş verebilir.
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white border border-green-200 rounded-2xl p-6 shadow-md'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                <span className='text-2xl'>✨</span>
              </div>
              <div className='flex-1'>
                <h4 className='font-bold text-gray-900 mb-2 text-lg'>Yönetim Kolaylığı</h4>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  Tüm işlemler tek bir panelden kolayca yönetilebilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}