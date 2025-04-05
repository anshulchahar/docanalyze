'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { exportToPDF, exportToMarkdown, downloadFile } from '@/utils/exportUtils';

interface ExportButtonProps {
    analysis: {
        summary: string;
        keyPoints: string[];
        detailedAnalysis: string;
        recommendations: string;
        documentComparison?: string;
        fileInfo: Array<{
            filename: string;
            character_count: number;
        }>;
    };
}

export default function ExportButton({ analysis }: ExportButtonProps) {
    const handleExport = async (format: 'pdf' | 'md' | 'txt') => {
        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const baseFilename = `docanalyze-analysis-${timestamp}`;

            switch (format) {
                case 'pdf': {
                    const pdfBytes = await exportToPDF(analysis);
                    downloadFile(pdfBytes, `${baseFilename}.pdf`, 'application/pdf');
                    break;
                }
                case 'md': {
                    const markdown = exportToMarkdown(analysis);
                    downloadFile(markdown, `${baseFilename}.md`, 'text/markdown');
                    break;
                }
                case 'txt': {
                    const text = exportToMarkdown(analysis);
                    downloadFile(text, `${baseFilename}.txt`, 'text/plain');
                    break;
                }
            }
        } catch (error) {
            console.error('Export failed:', error);
            // You might want to add error handling UI here
        }
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                Export
                <svg
                    className="w-5 h-5 ml-2 -mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    Export as PDF
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => handleExport('md')}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    Export as Markdown
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => handleExport('txt')}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    Export as Text
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}