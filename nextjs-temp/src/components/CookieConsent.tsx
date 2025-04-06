'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

    if (!showConsent) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
            <div className="relative max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {!showSettings ? (
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cookie Consent</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                                        By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                                    </p>
                                </div>
                                <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Customize
                                    </button>
                                    <button
                                        onClick={acceptAll}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Accept All
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                Please read our{' '}
                                <Link
                                    href="/terms"
                                    className="underline text-primary hover:text-primary-dark"
                                >
                                    Terms & Privacy Policy
                                </Link>
                                {' '}for more details.
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customize Cookie Preferences</h3>
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

                            <div className="mt-4 space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="necessary"
                                            name="necessary"
                                            type="checkbox"
                                            checked={preferences.necessary}
                                            disabled
                                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="necessary" className="font-medium text-gray-700 dark:text-gray-200">
                                            Necessary Cookies
                                        </label>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            These cookies are essential for website functionality and cannot be disabled.
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
                                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="analytics" className="font-medium text-gray-700 dark:text-gray-200">
                                            Analytics Cookies
                                        </label>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            These cookies help us understand how visitors interact with our website.
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
                                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="marketing" className="font-medium text-gray-700 dark:text-gray-200">
                                            Marketing Cookies
                                        </label>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            These cookies are used to track visitors across websites for marketing purposes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveCustomPreferences}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 