'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';
import type { Attribute } from 'next-themes';

interface ThemeProviderProps {
    children: ReactNode;
    attribute?: Attribute;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
    children,
    attribute = 'class',
    defaultTheme = 'system',
    enableSystem = true,
    disableTransitionOnChange = false
}: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute={attribute}
            defaultTheme={defaultTheme}
            enableSystem={enableSystem}
            disableTransitionOnChange={disableTransitionOnChange}
        >
            {children}
        </NextThemesProvider>
    );
} 