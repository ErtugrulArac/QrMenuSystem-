'use client';

import { useCartStore } from '@/store/cart';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';

export default function CartButton() {
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <Link
      href='/cart'
      style={{ position: 'fixed', bottom: '11rem', right: '1rem', zIndex: 9999 }}
      className='bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-110 transition-all duration-300'
      aria-label='Sepetim'
    >
      <div className='relative'>
        <FiShoppingCart className='w-7 h-7' />
        <span className='absolute -top-1 -right-1 bg-white text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-red-500'>
          {totalItems}
        </span>
      </div>
    </Link>
  );
}
