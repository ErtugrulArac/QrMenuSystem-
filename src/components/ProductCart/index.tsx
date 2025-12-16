"use client"
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { oneProductType } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/store/cart';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';

import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

const index = ({ products }: { products: oneProductType }) => {

    const { lang, t } = useLanguage()
    const { addItem } = useCartStore()
    const [isAdded, setIsAdded] = useState(false)
    const closeButtonRef = useRef<HTMLButtonElement>(null)
    
    const description = lang === 'TR' ? products.description : products.edescription;
    const shortDescription = description ? (description.length > 110 ? description.slice(0, 110) + '...' : description) : '';
    const productName = lang === 'TR' ? products.name : products.ename;

    const handleAddToCart = () => {
        addItem({
            id: products.id,
            name: products.name,
            ename: products.ename,
            price: products.price,
            image: products.image
        });
        setIsAdded(true);
        setTimeout(() => {
            closeButtonRef.current?.click();
        }, 800);
    };


    return (
        <Drawer>
            <DrawerTrigger asChild>
                <ul className={`flex flex-wrap gap-4 md:gap-6 justify-around items-center px-1 mt-4 font-outfit`}>
                    <div className='group flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 py-4 md:py-5 px-2 md:px-3 w-full rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-red-500/20 relative hover:border-red-300 transition-all duration-300 hover:scale-[1.02] animate-fadeInUp cursor-pointer' key={products.id}>
                        <div className='relative overflow-hidden rounded-xl flex-shrink-0'>
                            <div className='absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300'></div>
                            <Image
                                className='rounded-xl w-24 h-24 md:w-36 md:h-36 shadow-lg object-cover text-center group-hover:scale-110 transition-transform duration-300'
                                src={products.image}
                                alt={products.name}
                                width="144"
                                height="144"
                                loading='lazy'
                                placeholder="blur"
                                blurDataURL="https://i.hizliresim.com/74xpsgl.gif"
                                objectFit='cover'
                            />
                        </div>
                        <div className='flex w-full md:w-[70%] flex-col gap-2 md:gap-3 items-center md:items-start'>
                            <p className='w-full font-bold text-sm md:text-base capitalize text-gray-900 group-hover:text-red-700 transition-colors text-center md:text-left line-clamp-2'>{productName}</p>
                            <p className='text-xs text-gray-600 font-medium w-full text-center md:text-left line-clamp-2'>{shortDescription}</p>
                            <div className='flex items-end gap-1 mt-1'>
                                <span className='text-xl md:text-2xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent'>{products.price}</span>
                                <span className='text-xs md:text-sm font-bold text-gray-500'>₺</span>
                            </div>
                        </div>
                        <div className='absolute -right-1 -top-1 w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm'></div>
                    </div>
                </ul>
            </DrawerTrigger>
            <DrawerContent className='bg-gradient-to-b from-white to-gray-50 border-t-2 border-gray-200'>
                <div className="mx-auto w-full max-w-sm font-outfit">
                    <DrawerHeader className='space-y-4 border-b border-gray-200 pb-4'>
                        <div className='space-y-2'>
                            <h2 className='w-full font-black text-2xl capitalize bg-gradient-to-r from-gray-900 to-red-900 bg-clip-text text-transparent'>{productName}</h2>
                            <p className='text-sm font-medium w-full text-gray-600 leading-relaxed'>{description}</p>
                        </div>
                    </DrawerHeader>
                    <div className="py-6 flex flex-col gap-4 text-center justify-center items-center">
                        <div className='relative group'>
                            <div className='absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity'></div>
                            <Image
                                className='relative rounded-2xl size-48 shadow-2xl object-cover text-center hover:scale-105 transition-transform duration-300'
                                src={products.image}
                                alt={products.name}
                                width="300"
                                height="300"
                                loading='lazy'
                                placeholder="blur"
                                blurDataURL="https://i.hizliresim.com/74xpsgl.gif"
                            />
                        </div>

                        <div className='pt-2 space-y-2'>
                            <div className='flex items-baseline justify-center gap-1'>
                                <span className='text-4xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent'>{products.price}</span>
                                <span className='text-lg font-bold text-gray-500'>₺</span>
                            </div>
                            <p className='text-xs text-gray-500 font-medium'>{lang === 'TR' ? "Lezzetli bir seçim!" : "A delicious choice!"}</p>
                        </div>
                    </div>
                    <DrawerFooter className='border-t border-gray-200 gap-3'>
                        <div className='flex gap-3 w-full'>
                            <Button 
                                onClick={handleAddToCart}
                                disabled={isAdded}
                                className={`flex-1 ${isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'} text-white font-bold rounded-xl h-12 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2`}
                            >
                                {isAdded ? (
                                    <>
                                        <FiCheck className='w-5 h-5' />
                                        {lang === 'TR' ? "Sepete Eklendi!" : "Added to Cart!"}
                                    </>
                                ) : (
                                    <>
                                        <FiShoppingCart className='w-5 h-5' />
                                        {lang === 'TR' ? "Sepete Ekle" : "Add to Cart"}
                                    </>
                                )}
                            </Button>
                            <DrawerClose asChild>
                                <Button ref={closeButtonRef} className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl h-12 transition-all' variant={"secondary"}>
                                    {lang === 'TR' ? "Kapat" : "Close"}
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>

    )
}

export default index
