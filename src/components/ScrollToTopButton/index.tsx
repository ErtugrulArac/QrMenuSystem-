'use client';

import { useState, useEffect } from 'react';
import { FiChevronsUp } from 'react-icons/fi';

export default function ScrollToTopButton() {
    const [showScrollButton, setShowScrollButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollButton(window.scrollY > 200);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToMenu = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {showScrollButton && (
                <button
                    onClick={scrollToMenu}
                    className='fixed bottom-6 md:bottom-8 left-4 md:left-6 z-50 p-3 bg-white border-2 border-gray-300 hover:border-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110'
                    title='Kategorilere dön'
                    type='button'
                >
                    <FiChevronsUp className='w-5 h-5 text-gray-700 group-hover:text-red-600' />
                </button>
            )}
        </>
    );
}
