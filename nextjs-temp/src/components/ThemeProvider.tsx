'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    // Function to safely access browser APIs
    const isBrowser = typeof window !== 'undefined';

    // Initialize theme from localStorage
    useEffect(() => {
        if (!isBrowser) return;

        try {
            // Check if user has a preference stored
            const storedTheme = localStorage.getItem('theme') as Theme | null;

            if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
                setThemeState(storedTheme);
                document.documentElement.classList.toggle('dark', storedTheme === 'dark');
            }

            setMounted(true);
        } catch (e) {
            console.error('Error initializing theme:', e);
            setMounted(true);
        }
    }, [isBrowser]);

    // Update the DOM when the theme changes
    useEffect(() => {
        if (!isBrowser || !mounted) return;

        try {
            document.documentElement.classList.remove('light-theme', 'dark-theme');
            document.documentElement.classList.add(`${theme}-theme`);
            document.documentElement.classList.toggle('dark', theme === 'dark');

            // Apply a transition class to enable smooth transitions
            document.documentElement.classList.add('theme-transition');

            // Remove the transition class after transitions complete to prevent transition
            // when page initially loads
            const timeout = setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 500);

            return () => clearTimeout(timeout);
        } catch (e) {
            console.error('Error updating theme DOM:', e);
        }
    }, [theme, mounted, isBrowser]);

    // Set theme and update localStorage
    const setTheme = (newTheme: Theme) => {
        if (!isBrowser) return;

        try {
            setThemeState(newTheme);
            localStorage.setItem('theme', newTheme);
        } catch (e) {
            console.error('Error setting theme:', e);
        }
    };

    // Toggle between light and dark themes
    const toggleTheme = () => {
        try {
            setTheme(theme === 'light' ? 'dark' : 'light');
        } catch (e) {
            console.error('Error toggling theme:', e);
        }
    };

    // Prevent hydration mismatch by not rendering anything until mounted
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, resolvedTheme: theme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook for accessing the theme context
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}