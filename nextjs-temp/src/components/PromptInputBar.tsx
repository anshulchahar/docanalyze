'use client';

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import ErrorMessage from './ErrorMessage';

interface PromptInputBarProps {
    customPrompt: string;
    onCustomPromptChange: (prompt: string) => void;
    onAnalyze: () => void;
    canAnalyze: boolean;
    isAnalyzing: boolean;
    buttonText?: string;
    placeholder?: string;
    helperText?: string;
    errorMessage?: string;
}

export default function PromptInputBar({
    customPrompt,
    onCustomPromptChange,
    onAnalyze,
    canAnalyze,
    isAnalyzing,
    buttonText = 'Analyze',
    placeholder = 'Type additional instructions for analyzing your document...',
    helperText = 'Press Enter to submit • Shift+Enter for new line',
    errorMessage = ''
}: PromptInputBarProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [localError, setLocalError] = useState('');

    // Auto-resize the textarea as content grows
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 150); // Max height of 150px
        textarea.style.height = `${newHeight}px`;
    }, [customPrompt]);

    const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onCustomPromptChange(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Enter (but not with Shift+Enter for new line)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            if (!canAnalyze && !isAnalyzing) {
                setLocalError('Please upload a document before proceeding');
                return;
            }

            if (!isAnalyzing) {
                setLocalError(''); // Clear any previous errors
                onAnalyze();
            }
        }
    };

    // Show either the passed error or the local error
    const displayError = errorMessage || localError;

    // Send icon SVG
    const SendIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
        >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 z-10 pb-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-[#1E1E1E] dark:via-[#1E1E1E] dark:to-transparent">
            <div className="max-w-3xl mx-auto">
                <div className={`relative rounded-xl shadow-lg border ${displayError ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-[#2C2C2C]`}>
                    <textarea
                        ref={textareaRef}
                        placeholder={placeholder}
                        value={customPrompt}
                        onChange={handlePromptChange}
                        onKeyDown={handleKeyDown}
                        disabled={isAnalyzing}
                        className={`w-full px-4 py-3 pr-16 text-base resize-none overflow-hidden focus:outline-none rounded-xl bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white ${displayError ? 'focus:ring-red-500 border-red-300 dark:border-red-700' : ''}`}
                        style={{ maxHeight: '150px', minHeight: '52px' }}
                        rows={1}
                        aria-label="Custom analysis instructions"
                        aria-invalid={!!displayError}
                    />
                    <button
                        onClick={() => {
                            if (!canAnalyze && !isAnalyzing) {
                                setLocalError('Please upload a document before proceeding');
                                return;
                            }

                            if (!isAnalyzing) {
                                setLocalError(''); // Clear any previous errors
                                onAnalyze();
                            }
                        }}
                        disabled={isAnalyzing}
                        title={canAnalyze ? `Press Enter to ${buttonText.toLowerCase()}` : "Upload a document first"}
                        aria-label={buttonText}
                        className={`absolute right-2 bottom-2 p-2 rounded-lg flex items-center justify-center text-white transition-colors ${!isAnalyzing
                            ? 'bg-primary hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                            : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            }`}
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center">
                                <span className="inline-block w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="inline-block ml-1 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="inline-block ml-1 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                            </div>
                        ) : (
                            <SendIcon />
                        )}
                    </button>
                </div>

                <ErrorMessage message={displayError} className="ml-1 mt-1" />

                {!displayError && canAnalyze && !isAnalyzing && (
                    <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {helperText}
                    </div>
                )}
            </div>
        </div>
    );
} 