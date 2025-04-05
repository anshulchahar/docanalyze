'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AnalysisResult } from '@/types/api';
import AnalysisResults from '@/components/AnalysisResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';

export default function AnalysisDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { data: session, status } = useSession();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            setError('Please sign in to view this analysis');
            setLoading(false);
            return;
        }

        async function fetchAnalysis() {
            try {
                const response = await fetch(`/api/analysis/${id}`);

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch analysis');
                }

                const data = await response.json();
                setAnalysis(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchAnalysis();
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
                action={{ label: 'Back to History', href: '/history' }}
            />
        );
    }

    if (!analysis) {
        return (
            <ErrorDisplay
                message="Analysis not found"
                fullScreen
                action={{ label: 'Back to History', href: '/history' }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center mb-6">
                    <Link
                        href="/history"
                        className="mr-4 text-blue-500 hover:text-blue-600 flex items-center"
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
                        Back to History
                    </Link>
                    <h1 className="text-2xl font-bold">Analysis Details</h1>
                </div>

                <AnalysisResults analysis={analysis} />
            </div>
        </div>
    );
}