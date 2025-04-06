'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import DarkModeToggle from './DarkModeToggle';

export default function Navigation() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        return pathname === path;
    };

    const handleSignIn = () => {
        signIn('google', { callbackUrl: '/' });
    };

    return (
        <nav className="bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 w-full">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center">
                                <Image
                                    src="/solva.png"
                                    width={32}
                                    height={32}
                                    alt="Solva"
                                    className="h-8 w-auto"
                                />
                                <span className="ml-2 font-bold text-xl text-gray-900 dark:text-white">Solva</span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 lg:ml-12 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')
                                    ? 'border-primary text-gray-900 dark:text-white'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-500'
                                    }`}
                            >
                                Home
                            </Link>
                            {session && (
                                <Link
                                    href="/history"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/history')
                                        ? 'border-primary text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-500'
                                        }`}
                                >
                                    History
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="hidden sm:flex sm:items-center space-x-4 lg:space-x-6">
                        <DarkModeToggle className="mr-1" />

                        {status === 'loading' ? (
                            <div className="animate-pulse h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ) : session ? (
                            <div className="flex items-center space-x-3 lg:space-x-4">
                                <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:inline">
                                    {session.user?.name || session.user?.email}
                                </span>
                                <div className="relative">
                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        {session.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                width={32}
                                                height={32}
                                                alt={`${session.user.name}'s profile`}
                                            />
                                        ) : (
                                            <svg
                                                className="h-full w-full text-gray-300 dark:text-gray-500"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleSignIn}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                            >
                                Sign in
                            </button>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden space-x-1">
                        <DarkModeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? (
                                <svg
                                    className="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="sm:hidden bg-white dark:bg-gray-900 shadow-lg">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            href="/"
                            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/')
                                ? 'bg-primary-foreground border-primary text-primary-dark dark:text-primary-light'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 dark:hover:border-gray-600'
                                }`}
                        >
                            Home
                        </Link>
                        {session && (
                            <Link
                                href="/history"
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/history')
                                    ? 'bg-primary-foreground border-primary text-primary-dark dark:text-primary-light'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 dark:hover:border-gray-600'
                                    }`}
                            >
                                History
                            </Link>
                        )}
                    </div>
                    {session ? (
                        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        {session.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                width={40}
                                                height={40}
                                                alt={`${session.user.name}'s profile`}
                                            />
                                        ) : (
                                            <svg
                                                className="h-full w-full text-gray-300 dark:text-gray-500"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                        {session.user?.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {session.user?.email}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <button
                                    onClick={() => {
                                        signOut();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="px-4 py-2">
                                <button
                                    onClick={() => {
                                        handleSignIn();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                                >
                                    Sign in
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}