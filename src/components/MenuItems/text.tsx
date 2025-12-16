"use client";

import { useLanguage } from '@/hooks/useLanguage';

const text = ({text, text2}: {text: any, text2: string}) => {
  const { lang } = useLanguage()

  return (
    <p className={`w-16 md:w-24 text-center font-outfit font-extrabold text-xs md:text-sm capitalize line-clamp-2`}>
      {lang === 'TR' ? text : text2}
    </p>
  )
}

export default text
