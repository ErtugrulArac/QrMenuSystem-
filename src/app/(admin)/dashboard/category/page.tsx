'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import CategoryManager from '@/components/admin/categoryManager';

export default function CategoryPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-40 w-full'>
        <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
          <div className='flex items-center gap-2 md:gap-4'>
            <Link href="/dashboard" className='p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0'>
              <FiArrowLeft className='w-5 md:w-6 h-5 md:h-6 text-gray-600' />
            </Link>
            <div className='min-w-0 flex-1'>
              <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900'>Kategoriler</h1>
              <p className='text-gray-600 text-xs md:text-sm mt-0.5 md:mt-1'>Menü kategorilerini yönet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8'>
        <div className='bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6 mb-6 md:mb-8'>
          <div className='flex items-start gap-3 md:gap-4'>
            <div className='flex-shrink-0'>
              <span className='inline-flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-red-100'>
                <span className='text-base md:text-lg'>⚠️</span>
              </span>
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='font-semibold text-gray-900 text-sm md:text-base'>Dikkate Alınız</h3>
              <p className='text-gray-600 text-xs md:text-sm mt-1'>
                Yapacağınız değişiklikler canlı menüyü etkileyecektir. Lütfen dikkatli davranınız.
              </p>
            </div>
          </div>
        </div>

        <CategoryManager />
      </div>
    </div>
  );
}