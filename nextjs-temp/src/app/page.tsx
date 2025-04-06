'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import ProgressBar from '@/components/ProgressBar';
import Navigation from '@/components/Navigation';
import { AnalysisResult, AnalysisHistory } from '@/types/api';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Home() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const { isOpen } = useSidebar();

  useEffect(() => {
    // Fetch user's history when logged in
    if (session?.user) {
      fetchHistory();
    }
  }, [session]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

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
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setDebugInfo(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('pdfFiles', file);
      });

      // Add a progress event listener
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/analyze-complete', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setAnalysisResult(result);
          // If user is logged in, refresh history to include the new analysis
          if (session?.user) {
            fetchHistory();
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            setError(errorResponse.error || 'An error occurred during analysis');
            setDebugInfo(errorResponse.details || null);
          } catch (e) {
            setError('Failed to analyze document');
          }
        }
        setIsAnalyzing(false);
      };

      xhr.onerror = function () {
        setError('Failed to connect to the server');
        setIsAnalyzing(false);
      };

      // Send the form data
      xhr.send(formData);
    } catch (error) {
      setError('An error occurred');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setFiles([]);
    setProgress(0);
    setError(null);
    setDebugInfo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] transition-colors duration-200">
      <Navigation
        history={history}
      />

      <div className={`pt-16 pb-8 w-full transition-all duration-300 ease-in-out ${isOpen ? 'pl-64' : 'pl-16'}`}>
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full">
          <div className="mx-auto w-full md:w-[90%] lg:w-[85%] xl:w-[90%] 2xl:w-[95%]">
            {!analysisResult ? (
              <div className="shadow-sm rounded-lg p-6 pb-8 mt-8 dark:bg-[#1E1E1E] bg-gray-50">
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
              <div className="space-y-6 shadow-sm rounded-lg p-6 dark:bg-[#1E1E1E] bg-gray-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Results</h2>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors duration-200"
                  >
                    Analyze Another Document
                  </button>
                </div>
                <AnalysisResults analysis={analysisResult} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
