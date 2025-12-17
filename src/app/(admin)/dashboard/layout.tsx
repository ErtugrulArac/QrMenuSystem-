import React, { ReactNode } from 'react';
import QueryProvider from '@/provider/queryProvider'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: ReactNode }) => {
    // Server-side session kontrolü
    const session = await auth();
    
    // Giriş yapmamışsa login'e yönlendir
    if (!session) {
        console.log('🔴 [Dashboard Layout] No session - Redirecting to login');
        redirect('/auth/login');
    }
    
    console.log('✅ [Dashboard Layout] Session valid - User:', session.user?.email);
    
    return (
        <div className='w-full'>
            <QueryProvider>
                <main className='w-full'>{children}</main>
            </QueryProvider>
        </div>
    );
}

export default Layout;
