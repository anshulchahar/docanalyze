'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ThemeProvider';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </SessionProvider>
    );
}