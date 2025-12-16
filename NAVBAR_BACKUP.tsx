// BACKUP - ORIGINAL NAVBAR CODE
// Tarihi: December 14, 2025
// Eğer modern navbar beğenilmezse bunu geri kopyala

import Link from 'next/link'
import { BsInstagram } from 'react-icons/bs'
import Lang from "@/components/lang"


const index = () => {

    return (
        <div className='w-full bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 shadow-sm sticky top-0 z-50 animate-slideInDown'>
            <div className='px-2 md:px-3 py-3 md:py-5 container flex justify-between items-center'>
                <Link href={"/"} className='group'>
                    <div className='flex flex-col items-center gap-0.5 md:gap-1 hover:scale-105 transition-transform duration-300'>
                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity'></div>
                            <h2 className='relative text-lg md:text-2xl font-bold uppercase tracking-wider bg-gradient-to-r from-gray-900 to-red-900 bg-clip-text text-transparent font-osw'>arlancafe</h2>
                        </div>
                        <div className='h-0.5 md:h-1 w-12 md:w-16 bg-gradient-to-r from-red-600 to-orange-500 rounded-full'></div>
                        <h4 className='text-xs font-semibold tracking-widest text-gray-600 uppercase font-osw'>Digital Menu</h4>
                    </div>
                </Link>
                <div className='flex gap-2 md:gap-4 items-center'>
                    <a href="https://www.instagram.com/arlanmedya/?hl=tr" 
                       className='group p-1 md:p-2 rounded-lg hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50'>
                        <div className='p-1 md:p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-transparent group-hover:to-transparent transition-all'>
                            <BsInstagram className='text-gray-800 group-hover:text-white transition-colors text-base md:text-xl' size={20} />
                        </div>
                    </a>
                    <div className='h-4 md:h-6 w-px bg-gray-300'></div>
                    <Lang />
                </div>
            </div>
        </div>
    )
}

export default index
