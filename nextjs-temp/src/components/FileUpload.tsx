'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import ErrorMessage from './ErrorMessage';

interface FileUploadProps {
    files: File[];
    onFilesAdded: (files: File[]) => void;
    onFileRemoved: (index: number) => void;
    disabled?: boolean;
    maxFileSizeMb?: number;
}

// Valid file types and their display names
const VALID_FILE_TYPES = {
    'application/pdf': 'PDF',
    'text/markdown': 'Markdown',
    'text/plain': 'Text',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

// File type by extension mapping (for cases where MIME type is not reliable)
const FILE_EXTENSIONS: Record<string, string> = {
    'pdf': 'application/pdf',
    'md': 'text/markdown',
    'txt': 'text/plain',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

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

    // Check if the file is valid based on extension or MIME type
    const isValidFileType = (file: File): boolean => {
        // Get file extension
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop() || '';

        // First check by MIME type
        if (file.type in VALID_FILE_TYPES) {
            return true;
        }

        // Then check by extension if MIME type not recognized
        return fileExtension in FILE_EXTENSIONS;
    };

    // Get the standardized MIME type for a file
    const getStandardizedType = (file: File): string => {
        if (file.type in VALID_FILE_TYPES) {
            return file.type;
        }

        const fileExtension = file.name.toLowerCase().split('.').pop() || '';
        return FILE_EXTENSIONS[fileExtension] || file.type;
    };

    const processFiles = (newFiles: File[]) => {
        // Filter for valid file types
        const validTypeFiles = newFiles.filter(file => {
            const isValid = isValidFileType(file);
            if (!isValid) {
                setError(`Unsupported file type. Please upload PDF (.pdf), Markdown (.md), DOCX (.docx), or text (.txt) files only.`);
                return false;
            }
            return true;
        });

        // Check file size
        const validFiles = validTypeFiles.filter(file => {
            const isValidSize = file.size <= maxSizeBytes;
            if (!isValidSize) {
                setError(`File size must be less than ${maxFileSizeMb}MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            // Add standardized type to files to ensure consistent processing
            const filesWithType = validFiles.map(file => {
                const standardizedType = getStandardizedType(file);
                // Create a new File object with the standardized type if needed
                if (file.type !== standardizedType) {
                    return new File([file], file.name, { type: standardizedType });
                }
                return file;
            });

            onFilesAdded(filesWithType);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Get a display name for the file type
    const getFileTypeName = (file: File): string => {
        const standardizedType = getStandardizedType(file);
        return VALID_FILE_TYPES[standardizedType as keyof typeof VALID_FILE_TYPES] || 'File';
    };

    // Get appropriate icon for file type
    const getFileIcon = (file: File) => {
        const standardizedType = getStandardizedType(file);

        switch (standardizedType) {
            case 'application/pdf':
                return (
                    <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
            case 'text/markdown':
                return (
                    <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'text/plain':
                return (
                    <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return (
                    <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-testid="dropzone"
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${error ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10' :
                    isDragging ? 'border-primary-light bg-primary/5' :
                        disabled ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed' :
                            'border-gray-300 dark:border-gray-700 hover:border-primary-light dark:hover:border-primary-light'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept=".pdf,.md,.txt,.docx"
                    disabled={disabled}
                    data-testid="file-input"
                />
                <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Drag and drop files here</span> or click to select files
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, Markdown, DOCX, or text files up to {maxFileSizeMb}MB
                    </p>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}

            {files.length > 0 && (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                    {files.map((file, index) => (
                        <li
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <div className="flex items-center space-x-4">
                                {getFileIcon(file)}
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {getFileTypeName(file)} • {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onFileRemoved(index)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                aria-label="remove file"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}