'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AnalysisResult, AnalysisHistory } from '@/types/api';
import AnalysisResults from '@/components/AnalysisResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import Navigation from '@/components/Navigation';
import { useSidebar } from '@/contexts/SidebarContext';

export default function AnalysisDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { data: session, status } = useSession();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [history, setHistory] = useState<AnalysisHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isOpen } = useSidebar();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            setError('Please sign in to view this analysis');
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                // Fetch both analysis details and history in parallel
                const [analysisResponse, historyResponse] = await Promise.all([
                    fetch(`/api/analysis/${id}`),
                    fetch('/api/history', {
                        headers: { 'Cache-Control': 'no-cache' }
                    })
                ]);

                if (!analysisResponse.ok) {
                    const data = await analysisResponse.json();
                    throw new Error(data.error || 'Failed to fetch analysis');
                }

                if (!historyResponse.ok) {
                    console.error('Failed to fetch history, will continue with analysis only');
                }

                const analysisData = await analysisResponse.json();
                setAnalysis(analysisData);

                // If history fetch was successful, set it
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setHistory(historyData);
                }
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id, session, status]);

    if (status === 'loading' || loading) {
        return <LoadingSpinner fullScreen message="Loading analysis..." />;
    }

    if (!session) {
        return (
            <ErrorDisplay
                message="Please sign in to view this analysis"
                fullScreen
                action={{ label: 'Sign In', href: '/api/auth/signin' }}
            />
        );
    }

    if (error) {
        return (
            <ErrorDisplay
                message={error}
                fullScreen
                action={{ label: 'Back to Home', href: '/' }}
            />
        );
    }

    if (!analysis) {
        return (
            <ErrorDisplay
                message="Analysis not found"
                fullScreen
                action={{ label: 'Back to Home', href: '/' }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navigation history={history} />

            <main className={`w-full px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 py-8 transition-all duration-300 ${isOpen ? 'ml-[300px]' : 'ml-0'}`}>
                <div className="w-full max-w-6xl mx-auto">
                    <div className="flex items-center mb-6">
                        <Link
                            href="/"
                            className="mr-4 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary flex items-center"
                        >
                            <svg
                                className="w-5 h-5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Back to Home
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Details</h1>
                    </div>

                    <AnalysisResults analysis={analysis} />
                </div>
            </main>
        </div>
    );
}