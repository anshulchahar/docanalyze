'use client';

import { XCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface ErrorDisplayProps {
    message: string;
    details?: string;
    className?: string;
    onDismiss?: () => void;
    fullScreen?: boolean;
    action?: {
        label: string;
        href: string;
    };
}

export default function ErrorDisplay({
    message,
    details,
    className = '',
    onDismiss,
    fullScreen = false,
    action,
}: ErrorDisplayProps) {
    return (
        <div className={`rounded-md bg-red-50 p-4 ${fullScreen ? 'fixed inset-0 flex items-center justify-center z-50' : ''} ${className}`}>
            <div className="flex flex-col">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{message}</h3>
                        {details && (
                            <div className="mt-2 text-sm text-red-700">
                                <p>{details}</p>
                            </div>
                        )}
                    </div>
                    {onDismiss && (
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    onClick={onDismiss}
                                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {action && (
                    <div className="mt-4">
                        <Link
                            href={action.href}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {action.label}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}