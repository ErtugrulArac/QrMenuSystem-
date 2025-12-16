'use client';

import Link from 'next/link';
import Image from 'next/image';
import { categoryTypes } from '@/types'
import Text from './text';
import { useLanguage } from '@/hooks/useLanguage';

interface MenuClientProps {
  categories: categoryTypes[];
}

const MenuClient: React.FC<MenuClientProps> = ({ categories }) => {
  const { lang, t } = useLanguage();

  const getCategoryName = (category: any) => {
    return lang === 'TR' ? category.name : category.ename;
  };

  return (
    <div className='bg-white px-1 mt-4 md:mt-6'>
      <div className='border-2 border-gray-200 rounded-xl md:rounded-2xl pt-4 md:pt-6 pb-4 md:pb-6'>
        {/* Scroll Container */}
        <div className='overflow-x-auto scrollbar-hide scroll-smooth'>
          <div className='px-4 md:px-8 flex gap-4 md:gap-6 min-w-min'>
          {/* All Items Button */}
          <Link
            href="/category"
            className='group flex flex-col items-center gap-3 flex-shrink-0'
          >
            <div className='relative overflow-hidden rounded-xl md:rounded-2xl w-20 md:w-24 h-16 md:h-20 border-2 border-gray-200 group-hover:border-red-500 group-hover:shadow-lg transition-all duration-200 bg-white'>
              <Image
                src="/menu.webp"
                alt="Tüm Ürünler"
                width={96}
                height={80}
                loading='lazy'
                placeholder="blur"
                blurDataURL="https://i.hizliresim.com/74xpsgl.gif"
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
              />
            </div>
            <p className='text-xs md:text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors text-center w-20 md:w-24'>{t('all')}</p>
          </Link>

          {/* Categories */}
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/category/${item.id}`}
              className='group flex flex-col items-center gap-3 flex-shrink-0'
            >
              <div className='relative overflow-hidden rounded-xl md:rounded-2xl w-20 md:w-24 h-16 md:h-20 border-2 border-gray-200 group-hover:border-red-500 group-hover:shadow-lg transition-all duration-200 bg-white'>
                <Image
                  src={item.image}
                  alt={getCategoryName(item)}
                  width={96}
                  height={80}
                  loading='lazy'
                  placeholder="blur"
                  blurDataURL="https://i.hizliresim.com/74xpsgl.gif"
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                />
              </div>
              <p className='text-xs md:text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors text-center line-clamp-2 w-20 md:w-24'>
                {getCategoryName(item)}
              </p>
            </Link>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuClient;
