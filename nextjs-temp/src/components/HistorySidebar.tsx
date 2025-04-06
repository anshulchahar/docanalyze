'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnalysisHistory } from '@/types/api';
import { formatDate, truncateText } from '@/utils/formatters';
import { ClockIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface HistorySidebarProps {
    history: AnalysisHistory[];
    className?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function HistorySidebar({ history, className = '', isOpen, onClose }: HistorySidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            id="history-sidebar"
            className={`fixed top-16 left-0 h-[calc(100%-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md z-50 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } ${className}`}
            style={{
                width: '300px',
            }}
        >
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Document History</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* History Content */}
                <div className="flex-1 overflow-y-auto p-2">
                    {history.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                            <p>No documents analyzed yet</p>
                            <Link
                                href="/"
                                className="mt-3 inline-block text-primary dark:text-primary-light hover:underline"
                                onClick={onClose}
                            >
                                Analyze your first document
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {history.map((item) => (
                                <li key={item.id} className="py-1">
                                    <Link
                                        href={`/analysis/${item.id}`}
                                        className={`block px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${pathname === `/analysis/${item.id}` ? 'bg-gray-100 dark:bg-gray-700' : ''
                                            }`}
                                        onClick={onClose}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {item.filename}
                                            </span>
                                            <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                <ClockIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                                <span>{formatDate(item.createdAt)}</span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                                {truncateText(item.summary, 80)}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/"
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                        onClick={onClose}
                    >
                        New Analysis
                    </Link>
                </div>
            </div>
        </aside>
    );
} 