'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import ProgressBar from '@/components/ProgressBar';
import { AnalysisResult } from '@/types/api';

export default function Home() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError(null);
  };

  const handleFileRemoved = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setError(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file to analyze');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setProgress(10); // Start progress at 10%

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('pdfFiles', file);
    });

    try {
      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 5;
          return newProgress >= 90 ? 90 : newProgress; // Cap at 90% until actual completion
        });
      }, 1000);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze document');
      }

      setProgress(100);
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFiles([]);
    setAnalysisResult(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">DocAnalyze</h1>
              <p className="mt-2 text-lg text-gray-600">
                Upload PDF documents to analyze with AI
              </p>
            </div>

            {isAnalyzing ? (
              <div className="space-y-6">
                <ProgressBar progress={progress} />
                <div className="text-center">
                  <LoadingSpinner message="Analyzing your document..." />
                  <p className="mt-2 text-sm text-gray-500">
                    This may take a minute depending on the document size
                  </p>
                </div>
              </div>
            ) : (
              <>
                <FileUpload
                  files={files}
                  onFilesAdded={handleFilesAdded}
                  onFileRemoved={handleFileRemoved}
                  disabled={isAnalyzing}
                />

                {error && (
                  <div className="mt-4">
                    <ErrorDisplay message={error} />
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleAnalyze}
                    disabled={files.length === 0 || isAnalyzing}
                    className={`px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${files.length === 0 || isAnalyzing
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      }`}
                  >
                    Analyze Document
                    {!session && " (Sign in to save results)"}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                New Analysis
              </button>
            </div>
            <AnalysisResults analysis={analysisResult} />
          </div>
        )}
      </div>
    </div>
  );
}
