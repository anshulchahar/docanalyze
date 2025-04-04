'use client';

import { XCircleIcon } from '@heroicons/react/24/solid';

interface ErrorDisplayProps {
    message: string;
    details?: string;
    className?: string;
    onDismiss?: () => void;
}

export default function ErrorDisplay({
    message,
    details,
    className = '',
    onDismiss,
}: ErrorDisplayProps) {
    return (
        <div className={`rounded-md bg-red-50 p-4 ${className}`}>
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
        </div>
    );
}