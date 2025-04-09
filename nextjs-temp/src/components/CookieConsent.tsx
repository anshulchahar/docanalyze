'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Cookie preferences state
    const [preferences, setPreferences] = useState({
        necessary: true, // Always required
        analytics: true,
        marketing: false,
    });

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');

        // Only show the banner if no consent has been given yet
        if (!consent) {
            // Small delay to prevent flash on initial load
            const timer = setTimeout(() => {
                setShowConsent(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = () => {
        // Save consent with all options enabled
        saveConsent({
            necessary: true,
            analytics: true,
            marketing: true,
        });
    };

    const saveCustomPreferences = () => {
        // Save the current preferences
        saveConsent(preferences);
    };

    const saveConsent = (consentOptions: Record<string, boolean>) => {
        // Save to localStorage
        localStorage.setItem('cookie-consent', JSON.stringify({
            consented: true,
            timestamp: new Date().toISOString(),
            preferences: consentOptions,
        }));

        // Hide the consent banner
        setShowConsent(false);
        setShowSettings(false);
    };

    const handlePreferenceChange = (key: keyof typeof preferences) => {
        if (key === 'necessary') return; // Cannot toggle necessary cookies

        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const openSettings = () => {
        // Function to reopen cookie settings if user wants to change preferences later
        localStorage.removeItem('cookie-consent');
        setShowConsent(true);
        setShowSettings(true);
    };

    if (!showConsent) return null;

    return (
        <AnimatePresence>
            {showConsent && (
                <moion.div
                    className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:px-6 md:pb-4"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative mx-auto max-w-4xl">
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden backdrop-blur-sm">
                            {!showSettings ? (
                                <div className="p-3.5 sm:p-4">
                                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">Cookie Consent</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
                                                We use cookies to enhance your experience and analyze site usage.
                                            </p>
                                        </div>
                                        <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2">
                                            <button
                                                onClick={() => setShowSettings(true)}
                                                className="text-sm py-1.5 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                            >
                                                Customize
                                            </button>
                                            <button
                                                onClick={acceptAll}
                                                className="text-sm py-1.5 px-3 rounded-lg text-white bg-[var(--primary)] hover:bg-[var(--color-primary-dark)] transition-colors duration-150"
                                            >
                                                Accept All
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        By continuing, you agree to our{' '}
                                        <Link
                                            href="/terms"
                                            className="underline text-[var(--primary)] hover:text-[var(--color-primary-dark)]"
                                        >
                                            Privacy Policy
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white">Cookie Settings</h3>
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                            aria-label="Close settings"
                                        >
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="necessary"
                                                    name="necessary"
                                                    type="checkbox"
                                                    checked={preferences.necessary}
                                                    disabled
                                                    className="focus:ring-[var(--primary)] h-4 w-4 text-[var(--primary)] border-gray-300 rounded cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="necessary" className="font-medium text-gray-700 dark:text-gray-200">
                                                    Necessary Cookies
                                                </label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Essential for website functionality
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="analytics"
                                                    name="analytics"
                                                    type="checkbox"
                                                    checked={preferences.analytics}
                                                    onChange={() => handlePreferenceChange('analytics')}
                                                    className="focus:ring-[var(--primary)] h-4 w-4 text-[var(--primary)] border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="analytics" className="font-medium text-gray-700 dark:text-gray-200">
                                                    Analytics Cookies
                                                </label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Help us improve site performance and usage
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="marketing"
                                                    name="marketing"
                                                    type="checkbox"
                                                    checked={preferences.marketing}
                                                    onChange={() => handlePreferenceChange('marketing')}
                                                    className="focus:ring-[var(--primary)] h-4 w-4 text-[var(--primary)] border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="marketing" className="font-medium text-gray-700 dark:text-gray-200">
                                                    Marketing Cookies
                                                </label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Used for personalized recommendations
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="text-sm py-1.5 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveCustomPreferences}
                                            className="text-sm py-1.5 px-3 rounded-lg text-white bg-[var(--primary)] hover:bg-[var(--color-primary-dark)] transition-colors duration-150"
                                        >
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}