"use client"
import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { useLanguageContext, Language } from '@/contexts/LanguageContext';

const languages = [
  { code: 'TR' as Language, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'EN' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'DE' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'FR' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'ES' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'IT' as Language, name: 'Italiano', flag: '🇮🇹' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageContext();

  const handleChange = (value: string) => {
    setLanguage(value as Language);
  };

  const selected = languages.find(l => l.code === language) || languages[0];

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className="w-auto px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-red-500 focus:border-red-500 focus:ring-0 transition-all shadow-sm hover:shadow-md font-semibold text-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-base">{selected.flag}</span>
          <span>{selected.name}</span>
        </div>
      </SelectTrigger>
      <SelectContent className='border-2 border-gray-200 rounded-lg shadow-xl bg-white'>
        <SelectGroup>
          {languages.map((lng) => (
            <SelectItem key={lng.code} value={lng.code} className="cursor-pointer hover:bg-red-50">
              <div className="flex items-center gap-3 font-medium text-gray-900 py-1">
                <span className="text-base">{lng.flag}</span>
                <span>{lng.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
