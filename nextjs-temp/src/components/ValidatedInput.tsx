'use client';

import { useState, useEffect, InputHTMLAttributes, forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

interface ValidatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hideLabel?: boolean;
    helpText?: string;
    showErrorMessage?: boolean;
}

const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(({
    label,
    error,
    className = '',
    hideLabel = false,
    helpText,
    showErrorMessage = true,
    id,
    required,
    ...props
}, ref) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const hasError = !!error;
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    // Animate the error state when it changes
    useEffect(() => {
        if (hasError) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [error, hasError]);

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center">
                <label
                    htmlFor={inputId}
                    className={`block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 ${hideLabel ? 'sr-only' : ''}`}
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            </div>

            <div className="relative rounded-md">
                <input
                    id={inputId}
                    ref={ref}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${inputId}-error` : undefined}
                    className={`
            block w-full rounded-md shadow-sm
            ${hasError
                            ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-700'
                            : 'border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary dark:focus:border-primary-light'
                        }
            ${isAnimating ? 'animate-errorShake' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>

            {helpText && !hasError && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
            )}

            {showErrorMessage && hasError && (
                <ErrorMessage message={error} className="mt-1" id={`${inputId}-error`} />
            )}
        </div>
    );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput; 