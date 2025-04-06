'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Create a simple theme hook that doesn't throw
const useLocalTheme = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Initialize from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
            if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
                setTheme(storedTheme);
                document.documentElement.classList.toggle('dark', storedTheme === 'dark');
            } else {
                // Check system preference
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(isDark ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', isDark);
            }
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', nextTheme);
            document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        }
    };

    return { theme, toggleTheme };
};

export default function DarkModeToggle({ className = '' }: { className?: string }) {
    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Always use our local hook that doesn't throw
    const { theme, toggleTheme } = useLocalTheme();

    // After mounting, we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Prevent hydration mismatch by not rendering anything until mounted
        return <div className={`w-10 h-10 ${className}`} />;
    }

    return (
        <div className={`relative inline-flex items-center ${className}`}>
            <motion.button
                onClick={toggleTheme}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-gray-200/30 hover:bg-gray-200/50 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                whileTap={{ scale: 0.9 }}
                aria-label={`Current theme: ${theme}. Click to toggle theme.`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {theme === 'light' ? (
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-amber-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                        />
                    </motion.svg>
                ) : (
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-indigo-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                        <path
                            d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                        />
                    </motion.svg>
                )}
            </motion.button>

            {isHovered && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-md px-3 py-1 text-xs font-medium shadow-md whitespace-nowrap z-50"
                >
                    {theme === 'light' ? 'Light' : 'Dark'} mode
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700"></div>
                </motion.div>
            )}
        </div>
    );
}