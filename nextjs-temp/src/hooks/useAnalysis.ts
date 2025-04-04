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

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to analyze PDF');
            }

            const result = await response.json();
            setAnalysis(result);
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