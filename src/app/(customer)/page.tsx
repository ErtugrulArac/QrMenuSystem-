import Link from 'next/link'

export default async function Home() {
  return (
    <div className='min-h-[calc(100vh-80px)] bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4 py-2 sm:py-3'>
      <div className='w-full max-w-md animate-fadeInUp'>
        {/* Icon/Logo Section */}
        <div className='flex justify-center mb-8 sm:mb-12 animate-scaleIn'>
          <div className='relative'>
            {/* Glow Effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full blur-2xl opacity-30 animate-pulse'></div>
            
            {/* Logo Circle */}
            <div className='relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 shadow-2xl flex items-center justify-center overflow-hidden border-8 border-white'>
              <img 
                className='w-28 sm:w-36 h-28 sm:h-36 object-contain' 
                src='/logob.png' 
                alt='Arlan Café Logo' 
              />
            </div>
          </div>
        </div>
        
        {/* Text Section */}
        <div className='text-center space-y-6 sm:space-y-8 mb-10 sm:mb-14 animate-slideInDown'>
          {/* Main Title */}
          <div className='space-y-2 sm:space-y-3'>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight'>
              <span className='bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block'>
                KAFEMİZE
              </span>
              <span className='bg-gradient-to-r from-red-600 via-red-500 to-orange-600 bg-clip-text text-transparent block mt-1 sm:mt-2'>
                HOŞGELDİNİZ
              </span>
            </h1>
          </div>
          
          {/* Subtitle */}
          <p className='text-gray-600 text-base sm:text-lg leading-relaxed font-light max-w-sm mx-auto'>
            Modern QR menümüz ile restoranımızın tüm lezzetlerini keşfedin
          </p>
          
          {/* Decorative divider */}
          <div className='flex items-center justify-center gap-3'>
            <div className='w-8 h-px bg-gradient-to-r from-transparent to-red-500'></div>
            <span className='text-2xl'>🍽️</span>
            <div className='w-8 h-px bg-gradient-to-l from-transparent to-red-500'></div>
          </div>
        </div>
        
        {/* CTA Button */}
        <Link 
          className='group block w-full'
          href="/table-selection"
        >
          <button className='w-full relative px-6 sm:px-8 py-4 sm:py-5 font-bold text-white text-base sm:text-lg overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/40 active:scale-95 shadow-lg'>
            {/* Background Gradient */}
            <div className='absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-600'></div>
            
            {/* Hover Overlay */}
            <div className='absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            
            {/* Shine Effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-500'></div>
            
            {/* Content */}
            <span className='relative flex items-center justify-center gap-2 sm:gap-3'>
              <span>QR MENÜYE GİT</span>
              <svg 
                className='w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300' 
                fill='none' 
                stroke='currentColor' 
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M13 7l5 5m0 0l-5 5m5-5H6' />
              </svg>
            </span>
          </button>
        </Link>
        
        {/* Bottom Info */}
        <div className='mt-8 sm:mt-10 text-center'>
          <p className='text-xs sm:text-sm text-gray-500'>
            ✨ Hızlı, kolay ve güvenli sipariş al
          </p>
        </div>
      </div>
    </div>
  )
}
