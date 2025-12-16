'use client';

import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiArrowLeft, FiBell } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-toastify';

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
  status: 'pending' | 'confirmed' | 'rejected' | 'paid';
  customerNote?: string;
  createdAt: string;
  paidAt?: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'paid'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('🔄 Fetching orders from API...');
      const response = await fetch('/api/orders', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Sadece aktif siparişleri göster (pending ve confirmed)
        // Paid ve rejected siparişler gösterilmesin
        const activeOrders = data.filter((o: Order) => 
          o.status === 'pending' || o.status === 'confirmed'
        );
        console.log('📦 Active orders:', activeOrders.length, '(Total:', data.length, ')');
        setOrders(activeOrders);
      } else {
        console.log('❌ Failed to fetch orders:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setOrders(orders.map(o =>
          o.id === id ? { ...o, status: newStatus } : o
        ));
        const statusMessages: Record<Order['status'], string> = {
          pending: 'Sipariş beklemeye alındı',
          confirmed: 'Sipariş onaylandı!',
          rejected: 'Sipariş reddedildi',
          paid: 'Ödeme alındı'
        };
        toast.success(statusMessages[newStatus]);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Hata oluştu!');
    }
  };

  const approveOrder = async (id: string) => {
    try {
      const orderToApprove = orders.find(o => o.id === id);
      if (!orderToApprove) return;
      
      // Aynı masada confirmed sipariş var mı kontrol et
      const confirmedTableOrder = orders.find(o => 
        o.tableCode === orderToApprove.tableCode && 
        o.status === 'confirmed' &&
        o.id !== id
      );
      
      if (confirmedTableOrder) {
        // Mevcut confirmed siparişe ekle
        const mergedItems = [...confirmedTableOrder.items];
        
        orderToApprove.items.forEach((newItem: any) => {
          const existingItem = mergedItems.find(item => item.id === newItem.id);
          if (existingItem) {
            existingItem.quantity += newItem.quantity;
            existingItem.subtotal += newItem.subtotal;
          } else {
            mergedItems.push(newItem);
          }
        });
        
        const newSubtotal = confirmedTableOrder.subtotal + orderToApprove.subtotal;
        const newTax = confirmedTableOrder.tax + orderToApprove.tax;
        const newTotal = confirmedTableOrder.total + orderToApprove.total;
        
        let combinedNote = confirmedTableOrder.customerNote || '';
        if (orderToApprove.customerNote) {
          combinedNote = combinedNote 
            ? `${combinedNote} | ${orderToApprove.customerNote}` 
            : orderToApprove.customerNote;
        }
        
        // Confirmed siparişi güncelle
        const response = await fetch(`/api/orders/${confirmedTableOrder.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: mergedItems,
            subtotal: newSubtotal,
            tax: newTax,
            total: newTotal,
            customerNote: combinedNote,
            status: 'confirmed'
          })
        });
        
        if (response.ok) {
          // Pending siparişi sil
          await fetch(`/api/orders/${id}`, { method: 'DELETE' });
          
          // State'i güncelle
          setOrders(orders.filter(o => o.id !== id).map(o => 
            o.id === confirmedTableOrder.id 
              ? { ...o, items: mergedItems, subtotal: newSubtotal, tax: newTax, total: newTotal, customerNote: combinedNote }
              : o
          ));
          
          toast.success(`Sipariş ${confirmedTableOrder.tableCode} masasındaki mevcut siparişe eklendi!`);
        }
      } else {
        // Normal onaylama
        await updateOrderStatus(id, 'confirmed');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Hata oluştu!');
    }
  };

  const rejectOrder = async (id: string) => {
    await updateOrderStatus(id, 'rejected');
  };

  const removeItemFromOrder = async (orderId: string, itemId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Ürünü iptal edildi olarak işaretle
      const updatedItems = order.items.map(item => 
        item.id === itemId 
          ? { ...item, cancelled: true }
          : item
      );
      
      // İptal edilmemiş ürünleri say
      const activeItems = updatedItems.filter(item => !item.cancelled);
      
      // Eğer hiç aktif ürün kalmadıysa siparişi tamamen sil
      if (activeItems.length === 0) {
        const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
        if (response.ok) {
          setOrders(orders.filter(o => o.id !== orderId));
          toast.success('Tüm ürünler iptal edildi, sipariş kaldırıldı!');
        }
        return;
      }

      // Yeni toplamları hesapla (sadece aktif ürünler)
      const newSubtotal = activeItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newTax = newSubtotal * 0.10;
      const newTotal = newSubtotal + newTax;

      // API'ye güncelle
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal
        })
      });

      if (response.ok) {
        setOrders(orders.map(o => 
          o.id === orderId 
            ? { ...o, items: updatedItems, subtotal: newSubtotal, tax: newTax, total: newTotal }
            : o
        ));
        toast.success('Ürün iptal edildi!');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Ürün iptal edilirken hata oluştu!');
    }
  };

  const restoreItemToOrder = async (orderId: string, itemId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Ürünü tekrar aktif yap
      const updatedItems = order.items.map(item => 
        item.id === itemId 
          ? { ...item, cancelled: false }
          : item
      );
      
      // Aktif ürünlerle toplamı yeniden hesapla
      const activeItems = updatedItems.filter(item => !item.cancelled);
      const newSubtotal = activeItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newTax = newSubtotal * 0.10;
      const newTotal = newSubtotal + newTax;

      // API'ye güncelle
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal
        })
      });

      if (response.ok) {
        setOrders(orders.map(o => 
          o.id === orderId 
            ? { ...o, items: updatedItems, subtotal: newSubtotal, tax: newTax, total: newTotal }
            : o
        ));
        toast.success('Ürün tekrar işleme alındı!');
      }
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Ürün geri alınırken hata oluştu!');
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'paid',
          paidAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        await fetch('/api/accounting/daily-sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            tableCode: order.tableCode,
            total: order.total,
            subtotal: order.subtotal,
            tax: order.tax,
            items: order.items,
            paidAt: new Date().toISOString()
          })
        });

        // Masayı açık konuma getir
        const tablesResponse = await fetch('/api/tables');
        if (tablesResponse.ok) {
          const tables = await tablesResponse.json();
          const table = tables.find((t: any) => t.code === order.tableCode);
          if (table) {
            await fetch(`/api/tables/${table.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'open' })
            });
          }
        }

        // Bu masanın TÜM siparişlerini state'den kaldır
        // API zaten orders.json'dan sildi
        const tableCode = order.tableCode;
        const remainingOrders = orders.filter(o => o.tableCode !== tableCode);
        setOrders(remainingOrders);
        
        toast.success(`Ödeme alındı! Masa ${tableCode} temizlendi ve açıldı.`);
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast.error('Hata oluştu!');
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

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
                <div className='flex items-center gap-2 md:gap-3 flex-wrap'>
                  <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900'>Siparişler</h1>
                  {pendingCount > 0 && (
                    <span className='flex items-center gap-1 bg-red-100 text-red-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold animate-pulse whitespace-nowrap'>
                      <FiBell className='w-3 md:w-4 h-3 md:h-4' />
                      {pendingCount} bekleniyor
                    </span>
                  )}
                </div>
                <p className='text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1'>Toplam {orders.length} sipariş</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
        <div className='flex gap-2 md:gap-3 flex-wrap items-center'>
          {['all', 'pending', 'confirmed', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {status === 'all' && '📋 Tümü'}
              {status === 'pending' && '⌛ Beklemede'}
              {status === 'confirmed' && '✅ Onaylandı'}
              {status === 'rejected' && '❌ Reddedildi'}
            </button>
          ))}
          <div className='hidden md:block h-6 border-l border-gray-300'></div>
          <Link 
            href="/dashboard/orders/paid"
            className='px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl whitespace-nowrap w-full md:w-auto text-center'
          >
            💰 Ödenen Siparişler
          </Link>
        </div>
      </div>

      {/* Orders List */}
      <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 pb-8 md:pb-12'>
        <div className='space-y-3 md:space-y-4'>
          {filteredOrders.length === 0 ? (
            <div className='text-center py-12 bg-white rounded-xl border border-gray-200'>
              <p className='text-gray-600'>Bu kategoride sipariş yok</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  order.status === 'pending'
                    ? 'bg-yellow-50 border-yellow-300 shadow-lg'
                    : order.status === 'confirmed'
                    ? 'bg-green-50 border-green-300'
                    : order.status === 'paid'
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-red-50 border-red-300 opacity-75'
                }`}
              >
                <div className='bg-white border-b border-gray-200 p-4 md:p-6'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 md:gap-3 mb-2 flex-wrap'>
                        <h3 className='text-lg md:text-xl lg:text-2xl font-bold text-gray-900'>Masa {order.tableCode}</h3>
                        <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          order.status === 'pending'
                            ? 'bg-yellow-200 text-yellow-800'
                            : order.status === 'confirmed'
                            ? 'bg-green-200 text-green-800'
                            : order.status === 'paid'
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {order.status === 'pending' && '⏳ Beklemede'}
                          {order.status === 'confirmed' && '✅ Onaylandı'}
                          {order.status === 'paid' && '💰 Ödendi'}
                          {order.status === 'rejected' && '❌ Reddedildi'}
                        </span>
                      </div>
                      <p className='text-gray-600 text-sm'>
                        {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className='flex gap-2 w-full md:w-auto'>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveOrder(order.id)}
                            className='flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm md:text-base flex-1 md:flex-initial'
                          >
                            <FiCheck className='w-4 md:w-5 h-4 md:h-5' />
                            <span>Onayla</span>
                          </button>
                          <button
                            onClick={() => rejectOrder(order.id)}
                            className='flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm md:text-base flex-1 md:flex-initial'
                          >
                            <FiX className='w-4 md:w-5 h-4 md:h-5' />
                            <span>Reddet</span>
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => markAsPaid(order.id)}
                          className='flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm md:text-base w-full md:w-auto'
                        >
                          💰 Ödeme Al
                        </button>
                      )}
                      {order.status === 'paid' && order.paidAt && (
                        <div className='text-sm text-gray-600'>
                          Ödendi: {new Date(order.paidAt).toLocaleString('tr-TR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='p-4 md:p-6 bg-white/50'>
                  <div className='space-y-1.5 md:space-y-2 mb-3 md:mb-4'>
                    {order.items.map(item => (
                      <div 
                        key={item.id} 
                        className={`flex justify-between items-center text-xs md:text-sm gap-2 p-2 rounded-lg border transition-all ${
                          item.cancelled 
                            ? 'bg-gray-50 border-gray-200 opacity-60' 
                            : 'bg-white border-gray-100'
                        }`}
                      >
                        <span className={`flex-1 min-w-0 truncate ${
                          item.cancelled 
                            ? 'text-gray-400 line-through' 
                            : 'text-gray-700'
                        }`}>
                          {item.name} x {item.quantity}
                        </span>
                        <div className='flex items-center gap-2'>
                          <span className={`font-semibold whitespace-nowrap ${
                            item.cancelled 
                              ? 'text-gray-400 line-through' 
                              : 'text-gray-900'
                          }`}>
                            {item.subtotal.toFixed(2)}₺
                          </span>
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <>
                              {item.cancelled ? (
                                <button
                                  onClick={() => restoreItemToOrder(order.id, item.id)}
                                  className='text-green-600 hover:text-green-800 text-xs font-medium bg-green-50 px-3 py-1 rounded'
                                  title='Ürünü geri al'
                                >
                                  Geri Al
                                </button>
                              ) : (
                                <button
                                  onClick={() => removeItemFromOrder(order.id, item.id)}
                                  className='bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md transition-colors flex items-center justify-center'
                                  title='Ürünü iptal et'
                                >
                                  <FiX className='w-4 h-4' />
                                </button>
                              )}
                            </>
                          )}
                        </div>
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
                      <span>{order.total.toFixed(2)}₺</span>
                    </div>

                    {/* Customer Note */}
                    {order.customerNote && (
                      <div className='mt-4 pt-4 border-t border-gray-300'>
                        <p className='text-xs font-semibold text-gray-600 mb-2'>Müşteri Notu:</p>
                        <p className='text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg border-l-4 border-red-600'>
                          {order.customerNote}
                        </p>
                      </div>
                    )}
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
