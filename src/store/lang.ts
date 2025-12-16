'use client';

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Language = 'TR' | 'EN' | 'DE' | 'FR' | 'ES' | 'IT';

interface LangState {
    lang: Language;
    setLang: (lang: Language) => void;
}

export const useLanStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'TR',
      setLang: (lang: Language) => {
        console.log('🌍 Setting language to:', lang);
        set({ lang });
      },
    }),
    {
      name: 'qrmenu-language',
      storage: createJSONStorage(() => localStorage),
    }
  )
);