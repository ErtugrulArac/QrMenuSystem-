'use client'

import Link from 'next/link'
import { BsInstagram } from 'react-icons/bs'
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi'
import Lang from "@/components/lang"
import { useCartStore } from '@/store/cart'
import { useState, useEffect } from 'react'

const index = () => {
    const { getTotalItems } = useCartStore()
    const totalItems = getTotalItems()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className='w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50'>
            <div className='px-4 md:px-8 py-2 max-w-7xl mx-auto'>
                <div className='flex justify-between items-center'>
                    {/* Logo Section */}
                    <Link href={"/"} className='group flex-shrink-0'>
                        <div className='flex items-center gap-3'>
                            <div className='flex flex-col'>
                                <h2 className='text-lg sm:text-xl font-bold text-gray-900'>Arlan Café</h2>
                                <p className='text-xs text-gray-500 font-medium'>QR Menu</p>
                            </div>
                        </div>
                    </Link>

                    {/* Right Section */}
                    <div className='flex gap-2 sm:gap-3 md:gap-4 items-center'>
                        {/* Instagram */}
                        <a href="https://www.instagram.com/arlanmedya/?hl=tr" 
                           target='_blank'
                           rel='noopener noreferrer'
                           className='p-2 rounded-lg hover:bg-pink-50 transition-colors group hidden sm:flex items-center justify-center'>
                            <BsInstagram className='text-gray-700 group-hover:text-pink-600 transition-colors text-lg' />
                        </a>

                        {/* Divider */}
                        <div className='h-6 w-px bg-gray-200 hidden sm:block'></div>

                        {/* Language */}
                        {mounted && (
                            <Lang />
                        )}

                        {/* Cart Button */}
                        <Link href="/cart" className='relative group p-2.5 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors'>
                            <div className='relative'>
                                <FiShoppingCart className='text-gray-800 group-hover:text-red-600 transition-colors text-xl' />
                                {totalItems > 0 && (
                                    <span className='absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg'>
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Mobile Menu Button */}
                        {/* Button removed - drawer not needed */}
                    </div>
                </div>


            </div>
        </div>
    )
}

export default index
