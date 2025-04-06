'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnalysisHistory } from '@/types/api';
import { formatDate } from '@/utils/formatters';
import { useSidebar } from '@/contexts/SidebarContext';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface ChatGptStyleSidebarProps {
    history: AnalysisHistory[];
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatGptStyleSidebar({ history, isOpen, onClose }: ChatGptStyleSidebarProps) {
    const pathname = usePathname();
    const { toggle } = useSidebar();

    return (
        <>
            {/* Mobile backdrop overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 z-40"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Toggle button - fixed in top-left corner */}
            <button
                onClick={toggle}
                className="fixed top-3 left-3 z-50 flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-[#1E1E1E] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out"
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
                <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Main sidebar with title next to toggle */}
            <aside
                className={`
          fixed top-0 left-0 h-screen z-40
          w-64 bg-gray-50 dark:bg-[#1E1E1E]
          border-r border-gray-200 dark:border-gray-700
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
            >
                {/* Header with title to the right of toggle */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 ml-2"></div>
                    <h2 className="text-base font-medium text-gray-800 dark:text-gray-200 ml-5">Analysis History</h2>
                </div>

                {/* History list */}
                <div className="flex-1 overflow-y-auto pt-2">
                    {history.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No documents analyzed yet
                        </div>
                    ) : (
                        <div className="py-2">
                            {history.map((item) => {
                                const isActive = pathname === `/analysis/${item.id}`;

                                return (
                                    <Link
                                        key={item.id}
                                        href={`/analysis/${item.id}`}
                                        className={`
                      block px-4 py-3 mx-2 my-1 rounded-md
                      text-sm transition-colors duration-150
                      ${isActive
                                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'}
                    `}
                                    >
                                        <div className="flex flex-col space-y-1">
                                            <span className={`font-medium truncate ${isActive ? 'text-gray-900 dark:text-white' : ''}`}>
                                                {item.filename}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
} 