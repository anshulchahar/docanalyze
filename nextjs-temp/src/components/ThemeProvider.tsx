'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    // Initialize theme from localStorage and system preference
    useEffect(() => {
        // Check if user has a preference stored
        const storedTheme = localStorage.getItem('theme') as Theme | null;

        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        } else {
            // Check if user prefers dark mode
            const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(userPrefersDark ? 'dark' : 'light');
            document.documentElement.classList.toggle('dark', userPrefersDark);
        }
    }, []);

    // Update localStorage and document class when theme changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // Function to toggle between light and dark themes
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
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