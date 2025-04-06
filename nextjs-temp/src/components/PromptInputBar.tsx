'use client';

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';

interface PromptInputBarProps {
    customPrompt: string;
    onCustomPromptChange: (prompt: string) => void;
    onAnalyze: () => void;
    canAnalyze: boolean;
    isAnalyzing: boolean;
    buttonText?: string;
    placeholder?: string;
    helperText?: string;
}

export default function PromptInputBar({
    customPrompt,
    onCustomPromptChange,
    onAnalyze,
    canAnalyze,
    isAnalyzing,
    buttonText = 'Analyze',
    placeholder = 'Type additional instructions for analyzing your document...',
    helperText = 'Press Enter to submit • Shift+Enter for new line'
}: PromptInputBarProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isMultiline, setIsMultiline] = useState(false);

    // Auto-resize the textarea as content grows
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 150); // Max height of 150px
        textarea.style.height = `${newHeight}px`;

        // Check if content has multiple lines
        setIsMultiline(textarea.scrollHeight > 60);
    }, [customPrompt]);

    const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onCustomPromptChange(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Enter (but not with Shift+Enter for new line)
        if (e.key === 'Enter' && !e.shiftKey && canAnalyze && !isAnalyzing) {
            e.preventDefault();
            onAnalyze();
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-10 pb-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-[#1E1E1E] dark:via-[#1E1E1E] dark:to-transparent">
            <div className="max-w-3xl mx-auto">
                <div className="relative rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2C2C2C]">
                    <textarea
                        ref={textareaRef}
                        placeholder={placeholder}
                        value={customPrompt}
                        onChange={handlePromptChange}
                        onKeyDown={handleKeyDown}
                        disabled={isAnalyzing}
                        className="w-full px-4 py-3 pr-24 text-base resize-none overflow-hidden focus:outline-none rounded-xl bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white"
                        style={{ maxHeight: '150px', minHeight: '52px' }}
                        rows={1}
                    />
                    <button
                        onClick={onAnalyze}
                        disabled={!canAnalyze || isAnalyzing}
                        title={canAnalyze ? `Press Enter to ${buttonText.toLowerCase()}` : "Upload a document first"}
                        className={`absolute right-2 bottom-2 rounded-lg px-4 py-2 font-medium text-white transition-colors ${canAnalyze && !isAnalyzing
                                ? 'bg-primary hover:bg-primary-dark'
                                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            }`}
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center">
                                <span className="animate-pulse">Analyzing</span>
                                <span className="inline-block ml-1 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="inline-block ml-1 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="inline-block ml-1 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                            </div>
                        ) : (
                            buttonText
                        )}
                    </button>
                </div>

                {!canAnalyze && !isAnalyzing && (
                    <div className="text-center mt-2 text-sm text-red-500 dark:text-red-400">
                        Please upload a document before analyzing
                    </div>
                )}

                {canAnalyze && !isAnalyzing && (
                    <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {helperText}
                    </div>
                )}
            </div>
        </div>
    );
} 