'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface FileUploadProps {
    files: File[];
    onFilesAdded: (files: File[]) => void;
    onFileRemoved: (index: number) => void;
    disabled?: boolean;
    maxFileSizeMb?: number;
}

export default function FileUpload({
    files,
    onFilesAdded,
    onFileRemoved,
    disabled = false,
    maxFileSizeMb = 10, // Default max file size: 10MB
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const maxSizeBytes = maxFileSizeMb * 1024 * 1024;

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        setError(null);
        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setError(null);
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);

        // Reset the input so the same file can be selected again if removed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const processFiles = (newFiles: File[]) => {
        // Filter for PDF files
        const pdfFiles = newFiles.filter(file => {
            const isPdf = file.type === 'application/pdf';
            if (!isPdf) {
                setError('Only PDF files are allowed');
                return false;
            }
            return true;
        });

        // Check file size
        const validFiles = pdfFiles.filter(file => {
            const isValidSize = file.size <= maxSizeBytes;
            if (!isValidSize) {
                setError(`File size must be less than ${maxFileSizeMb}MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            onFilesAdded(validFiles);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-4">
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 my-8 text-center cursor-pointer transition-colors ${isDragging
                    ? 'border-gold-500'
                    : disabled
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-gold-500'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,application/pdf"
                    multiple
                    disabled={disabled}
                />
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900">
                    {disabled ? (
                        'Upload in progress...'
                    ) : (
                        <>
                            Drag & drop PDF files or <span className="text-gold-500">browse</span>
                        </>
                    )}
                </p>
                <p className="mt-1 text-xs text-gray-500">PDF files up to {maxFileSizeMb}MB</p>
            </div>

            {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Selected Files</h4>
                    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                        {files.map((file, index) => (
                            <li key={index} className="px-4 py-3 flex items-center justify-between bg-white">
                                <div className="flex items-center">
                                    <svg
                                        className="h-6 w-6 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                {!disabled && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onFileRemoved(index);
                                        }}
                                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}