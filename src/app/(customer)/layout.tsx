import React, { ReactNode } from 'react';
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartButton from "@/components/CartButton";
import WaiterButton from "@/components/WaiterButton";
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="md:w-[50%] lg:w-[30%] m-auto max-md:w-[90%] font-sans flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CartButton />
        <WaiterButton />
      </div>
    </LanguageProvider>
  );
}
