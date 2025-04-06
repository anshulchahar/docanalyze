'use client';

import { useState, useEffect } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

interface ErrorMessageProps {
    message: string;
    className?: string;
    icon?: boolean;
    animated?: boolean;
    id?: string;
}

export default function ErrorMessage({
    message,
    className = '',
    icon = true,
    animated = true,
    id
}: ErrorMessageProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // If there's a message and animation is enabled, animate it in
        if (message && animated) {
            setIsVisible(true);
        } else if (!message) {
            setIsVisible(false);
        } else {
            // If not animated, just show it immediately
            setIsVisible(true);
        }
    }, [message, animated]);

    if (!message) return null;

    return (
        <div
            className={`
        flex items-start text-red-600 dark:text-red-400 text-sm mt-1
        ${animated ? `transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-1'}` : ''}
        ${className}
      `}
            role="alert"
            aria-live="polite"
            id={id}
        >
            {icon && (
                <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mr-1.5" aria-hidden="true" />
            )}
            <span>{message}</span>
        </div>
    );
} 