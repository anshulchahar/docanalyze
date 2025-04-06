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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError(null);
    setDebugInfo(null);
  };

  const handleFileRemoved = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setError(null);
    setDebugInfo(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file to analyze');
      return;
    }

    setError(null);
    setDebugInfo(null);
    setIsAnalyzing(true);
    setProgress(10); // Start progress at 10%

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('pdfFiles', file);
    });

    try {
      console.log('Starting analysis request with files:', files.map(f => `${f.name} (${f.size} bytes)`));

      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 5;
          return newProgress >= 90 ? 90 : newProgress; // Cap at 90% until actual completion
        });
      }, 1000);

      // Use the analyze-complete endpoint that was working previously
      const response = await fetch('/api/analyze-complete', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      // Get response details for debugging
      const contentType = response.headers.get('content-type');

      // For any non-JSON response, show the raw response
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);

        // Keep first 500 chars of response for debugging
        const preview = text.substring(0, 500) + (text.length > 500 ? '...' : '');
        setDebugInfo(`Status: ${response.status}, Content-Type: ${contentType}, Response: ${preview}`);

        throw new Error('Server returned an invalid response format');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document');
      }

      setProgress(100);
      setAnalysisResult(data as AnalysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
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
    setDebugInfo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 pt-16 pb-8 w-full">
        <div className="mx-auto w-full md:w-[90%] lg:w-[85%] xl:w-[90%] 2xl:w-[95%]">
          {!analysisResult ? (
            <div className="shadow-sm rounded-lg p-6 pb-8 mt-8 dark:bg-gray-900 bg-gray-50">
              {isAnalyzing ? (
                <div className="space-y-6">
                  <ProgressBar progress={progress} />
                  <div className="text-center">
                    <LoadingSpinner message="Analyzing your document..." />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
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

                      {debugInfo && (
                        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-200 rounded overflow-auto max-h-40">
                          <details>
                            <summary className="cursor-pointer text-gray-800 dark:text-gray-100">Debug Info</summary>
                            <div className="text-gray-700 dark:text-gray-200">{debugInfo}</div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleAnalyze}
                      disabled={files.length === 0 || isAnalyzing}
                      className={`px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${files.length === 0 || isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      <span className="brightness-110">Analyze Document</span>
                      {!session && <span className="brightness-110"> (Sign in to save results)</span>}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6 shadow-sm rounded-lg p-6 dark:bg-gray-900 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Results</h2>
                <button
                  onClick={resetAnalysis}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-200 flex items-center transition-colors"
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
    </div>
  );
}
