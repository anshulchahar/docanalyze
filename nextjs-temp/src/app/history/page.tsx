'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnalysisHistory } from '@/types/api';
import { formatDate, truncateText } from '@/utils/formatters';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [history, setHistory] = useState<AnalysisHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        // Redirect to sign-in if not authenticated
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/history');
            return;
        }

        async function fetchHistory() {
            try {
                const response = await fetch('/api/history', {
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch history');
                }

                const data = await response.json();
                setHistory(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An error occurred');
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [session, status, router]);

    if (status === 'loading' || loading) {
        return <LoadingSpinner fullScreen message="Loading history..." />;
    }

    // This should not happen due to the redirect in useEffect, but just in case
    if (status === 'unauthenticated') {
        return (
            <ErrorDisplay
                message="Please sign in to view your history"
                fullScreen
                action={{ label: 'Sign In', href: '/auth/signin?callbackUrl=/history' }}
            />
        );
    }

    if (error) {
        return <ErrorDisplay message={error} fullScreen />;
    }

    if (history.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    <h2 className="mt-2 text-lg font-medium text-gray-900">No analyses found</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        You haven&apos;t analyzed any documents yet.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Start Your First Analysis
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Your Analysis History</h1>
                    <p className="text-gray-500">
                        Review and access your past document analyses.
                    </p>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {history.length === 0 ? (
                            <div className="text-center py-10">
                                <p>You haven&apos;t analyzed any documents yet.</p>
                                <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
                                    Analyze your first document
                                </Link>
                            </div>
                        ) : (
                            history.map((item) => (
                                <li key={item.id}>
                                    <Link
                                        href={`/analysis/${item.id}`}
                                        className="block hover:bg-gray-50 transition duration-150 ease-in-out"
                                    >
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="truncate">
                                                    <div className="flex text-sm">
                                                        <p className="font-medium text-blue-600 truncate">
                                                            {item.filename}
                                                        </p>
                                                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                                            on {formatDate(item.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-sm text-gray-700">
                                                            {truncateText(item.summary, 150)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex-shrink-0">
                                                    <svg
                                                        className="h-5 w-5 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div className="mt-6 flex justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        New Analysis
                    </Link>
                </div>
            </div>
        </div>
    );
}