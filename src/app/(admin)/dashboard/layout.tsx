import React, { ReactNode } from 'react';
import QueryProvider from '@/provider/queryProvider'

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className='w-full'>
            <QueryProvider>
                <main className='w-full'>{children}</main>
            </QueryProvider>
        </div>
    );
}

export default Layout;
