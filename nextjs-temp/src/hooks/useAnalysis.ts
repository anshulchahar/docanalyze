import { useState } from 'react';

interface Analysis {
    summary: string;
    keyPoints: string[];
    detailedAnalysis: string;
    recommendations: string;
    documentComparison?: string;
    fileInfo: Array<{
        filename: string;
        character_count: number;
    }>;
}

export function useAnalysis() {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [progress, setProgress] = useState(0);

    const addFiles = (newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearFiles = () => {
        setFiles([]);
    };

    const analyze = async () => {
        if (!files.length) {
            setError('Please select at least one PDF file');
            return;
        }

        setLoading(true);
        setError('');
        setProgress(0);

        const formData = new FormData();
        files.forEach(file => formData.append('pdfFiles', file));

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            // Check Content-Type to ensure it's JSON before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned an invalid response format');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze PDF');
            }

            setAnalysis(data);
            setProgress(100);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return {
        files,
        loading,
        error,
        analysis,
        progress,
        addFiles,
        removeFile,
        clearFiles,
        analyze,
    };
}