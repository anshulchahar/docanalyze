'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnalysisHistory } from '@/types/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import Navigation from '@/components/Navigation';
import { useSidebar } from '@/contexts/SidebarContext';

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<AnalysisHistory[]>([]);
    const { isOpen } = useSidebar();

    useEffect(() => {
        if (status === 'loading') return;

        // If logged in, fetch history before redirecting
        if (session?.user) {
            fetchHistory().then(() => {
                // Redirect to home page after fetching history
                router.push('/');
            });
        } else {
            // If not logged in, just redirect
            router.push('/');
        }
    }, [status, router, session]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history', {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
        return Promise.resolve();
    };

    if (status === 'loading' || loading) {
        return <LoadingSpinner fullScreen message="Loading..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
            <Navigation history={history} />

            <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${isOpen ? 'ml-[300px]' : 'ml-0'}`}>
                <div className="text-center">
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Redirecting to home page...</h2>
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}