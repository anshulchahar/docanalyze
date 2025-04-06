'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types/api';
import DownloadButton from './DownloadButton';

interface AnalysisResultsProps {
    analysis: AnalysisResult;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
    const [activeTab, setActiveTab] = useState('summary');

    const tabs = [
        { id: 'summary', label: 'Summary' },
        { id: 'keyPoints', label: 'Key Points' },
        { id: 'detailedAnalysis', label: 'Detailed Analysis' },
        { id: 'recommendations', label: 'Recommendations' },
    ];

    // Only add the comparison tab if there are multiple files
    if (analysis.documentComparison && analysis.fileInfo && analysis.fileInfo.length > 1) {
        tabs.push({ id: 'comparison', label: 'Comparison' });
    }

    // Convert the AnalysisResult to the format expected by the DownloadButton
    const downloadData = {
        title: `Document Analysis Report`,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        detailedAnalysis: analysis.detailedAnalysis,
        recommendations: Array.isArray(analysis.recommendations)
            ? analysis.recommendations
            : analysis.recommendations ? [analysis.recommendations] : [],
        documentComparison: analysis.documentComparison,
        fileInfo: analysis.fileInfo,
    };

    return (
        <div className="bg-white dark:bg-[#2C2C2C] shadow-lg rounded-lg overflow-hidden transition-colors duration-200 border dark:border-[#333333]">
            {/* Document Info */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-[#333333]">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Document Information</h3>
                    <DownloadButton analysisData={downloadData} className="ml-4" />
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.fileInfo?.map((file, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-6 w-6 text-red-500 dark:text-red-400"
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
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{file.filename}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {file.pages} pages • {file.fileSize}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-[#333333]">
                <nav className="flex -mb-px overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-primary text-primary dark:text-primary-light dark:border-primary-light'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'summary' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Summary</h3>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{analysis.summary}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'keyPoints' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Points</h3>
                        <ul className="space-y-3">
                            {analysis.keyPoints?.map((point, index) => (
                                <li key={index} className="flex space-x-3">
                                    <svg
                                        className="h-6 w-6 flex-shrink-0 text-green-500 dark:text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'detailedAnalysis' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detailed Analysis</h3>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{analysis.detailedAnalysis}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'recommendations' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Recommendations & Next Steps
                        </h3>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{analysis.recommendations}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'comparison' && analysis.documentComparison && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Document Comparison</h3>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{analysis.documentComparison}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}