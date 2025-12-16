'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useLanguage } from '@/hooks/useLanguage';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiCheck } from 'react-icons/fi';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, tableNumber, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const { lang, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerNote, setCustomerNote] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.10;
  const finalTotal = totalPrice + tax;

  const handleSubmitOrder = async () => {
    if (!tableNumber || items.length === 0) {
      alert(lang === 'TR' ? 'Masa numarası veya ürün bulunamadı!' : 'Table number or products not found!');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        tableCode: tableNumber,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        subtotal: totalPrice,
        tax: tax,
        total: finalTotal,
        status: 'pending',
        customerNote: customerNote,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        clearCart();
        setCustomerNote('');
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/category');
        }, 2000);
      } else {
        const error = await response.json();
        alert('Sipariş gönderilemedi: ' + (error.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('❌ Sipariş hatası:', error);
      alert('Sipariş gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>{lang === 'TR' ? 'Yükleniyor...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!tableNumber) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
        <div className='bg-red-100 rounded-full p-8 mb-6'>
          <FiShoppingCart className='w-20 h-20 text-red-400' />
        </div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>{lang === 'TR' ? 'Masa Seçilmedi' : 'No Table Selected'}</h2>
        <p className='text-gray-600 text-center mb-6'>
          {lang === 'TR' ? 'Lütfen önce bir masa seçin' : 'Please select a table first'}
        </p>
        <Link
          href='/table-selection'
          className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all'
        >
          {lang === 'TR' ? 'Masa Seç' : 'Select Table'}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
        <div className='bg-gray-100 rounded-full p-8 mb-6'>
          <FiShoppingCart className='w-20 h-20 text-gray-400' />
        </div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>{t('emptyCart')}</h2>
        <p className='text-gray-600 text-center mb-6'>
          {t('emptyCartDescription')}
        </p>
        <Link
          href='/category'
          className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
          </svg>
          {t('goToMenu')}
        </Link>
      </div>
    );
  }

  return (
    <div className='pb-32 px-4 py-6 animate-fadeInUp'>
      {showSuccess && (
        <div className='fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slideDown'>
          <FiCheck className='w-6 h-6' />
          <span className='font-bold'>{t('orderPlaced')}</span>
        </div>
      )}

      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>{t('myCart')}</h1>
            <p className='text-gray-600 text-sm mt-1'>
              {t('table')}: <span className='font-bold text-red-600'>{tableNumber}</span>
            </p>
          </div>
          <Link
            href='/category'
            className='text-red-600 hover:text-red-700 font-medium text-sm'
          >
            + {t('addMoreProducts')}
          </Link>
        </div>
        
        {/* Not Kutusu */}
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4'>
          <p className='text-sm text-gray-700'>
            <span className='font-semibold'>{lang === 'TR' ? 'Not:' : 'Note:'}</span>{' '}
            {lang === 'TR' 
              ? 'Herhangi bir konuda yardıma ihtiyaç duyarsanız ' 
              : 'If you need any assistance, please '}
            <Link
              href='#'
              onClick={(e) => {
                e.preventDefault();
                alert(lang === 'TR' ? 'Garson çağrılıyor...' : 'Calling waiter...');
              }}
              className='text-red-600 hover:text-red-700 font-semibold underline'
            >
              {lang === 'TR' ? 'garson çağırma butonunu kullanabilirsiniz' : 'use the waiter call button'}
            </Link>
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12'>
              <div className='bg-gray-100 rounded-full p-6 mb-4'>
                <FiShoppingCart className='w-12 h-12 text-gray-400' />
              </div>
              <p className='text-gray-600 text-center mb-4'>
                {lang === 'TR' ? 'Sepetiniz boş' : 'Your cart is empty'}
              </p>
              <Link
                href='/category'
                className='px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700'
              >
                {lang === 'TR' ? 'Ürün Ekle' : 'Add Products'}
              </Link>
            </div>
          ) : (
            <>
              <div className='space-y-3 mb-6'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className='bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm'
                  >
                    <div className='flex gap-4'>
                      <div className='w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-cover'
                        />
                      </div>

                      <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-gray-900 truncate mb-1'>{item.name}</h3>
                        <p className='text-sm text-gray-500 mb-3'>{item.ename}</p>
                        
                        <div className='flex items-center justify-between gap-4'>
                          <div className='flex items-center gap-2 bg-gray-50 rounded-lg p-1'>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className='w-7 h-7 rounded-md bg-white hover:bg-gray-200 flex items-center justify-center transition-colors shadow-sm'
                            >
                              <FiMinus className='w-3.5 h-3.5' />
                            </button>
                            <span className='w-8 text-center font-bold text-sm'>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className='w-7 h-7 rounded-md bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm'
                            >
                              <FiPlus className='w-3.5 h-3.5' />
                            </button>
                          </div>

                          <div className='text-right'>
                            <div className='font-bold text-red-600 text-lg'>
                              ₺{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className='text-red-500 hover:text-red-700 p-2'
                      >
                        <FiTrash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className='bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm mb-6'>
                <label className='block text-sm font-bold text-gray-900 mb-3'>{t('customerNote')}</label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder={t('noteExample')}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none'
                  rows={3}
                />
                <p className='text-xs text-gray-500 mt-2'>{t('specialNotes')}</p>
              </div>

              <div className='bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg mb-6'>
                <h3 className='font-bold text-gray-900 mb-4 text-lg'>{lang === 'TR' ? 'Sipariş Özeti' : 'Order Summary'}</h3>
                
                <div className='space-y-3 mb-4 pb-4 border-b border-gray-200'>
                  <div className='flex justify-between text-gray-600'>
                    <span>{t('subtotal')}</span>
                    <span>₺{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-gray-600'>
                    <span>{t('tax')}</span>
                    <span>₺{tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className='flex justify-between items-center text-xl font-bold'>
                  <span>{t('total')}</span>
                  <span className='text-red-600'>₺{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl'>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className='w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? (
                    <span className='flex items-center justify-center gap-2'>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                      {lang === 'TR' ? 'Gönderiliyor...' : 'Sending...'}
                    </span>
                  ) : (
                    `${t('placeOrder')} (₺${finalTotal.toFixed(2)})`
                  )}
                </button>
              </div>
            </>
          )}
    </div>
  );
}
