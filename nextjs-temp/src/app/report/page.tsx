'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import CustomSelect, { SelectOption } from '@/components/CustomSelect';

export default function ReportPage() {
    const { isOpen } = useSidebar();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contentType: '',
        url: '',
        details: ''
    });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const contentTypeOptions: SelectOption[] = [
        { value: 'copyright', label: 'Copyright Infringement' },
        { value: 'harmful', label: 'Harmful or Dangerous Content' },
        { value: 'hateful', label: 'Hate Speech or Harassment' },
        { value: 'personal', label: 'Personal Information' },
        { value: 'other', label: 'Other Illegal Content' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus('submitting');

        // Simulate form submission
        setTimeout(() => {
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                contentType: '',
                url: '',
                details: ''
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] transition-colors duration-200">
            <Navigation history={[]} />

            <div className={`pt-16 pb-8 w-full transition-all duration-300 ease-in-out ${isOpen ? 'pl-64' : 'pl-16'}`}>
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full">
                    <div className="mx-auto w-full max-w-4xl">
                        <div className="bg-white dark:bg-[#2C2C2C] border dark:border-[#333333] rounded-lg shadow-lg p-6 mb-8">
                            <div className="flex items-center mb-6">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Illegal Content</h1>
                            </div>

                            <div className="space-y-6">
                                <div className="text-lg text-gray-700 dark:text-gray-200 mb-8">
                                    <p>
                                        We take reports of illegal or harmful content seriously. Please provide as much detail as possible to help us investigate the matter efficiently.
                                    </p>
                                </div>

                                {submitStatus === 'success' ? (
                                    <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-6 rounded-lg border border-green-200 dark:border-green-800/30">
                                        <h3 className="text-lg font-medium">Report submitted successfully</h3>
                                        <p className="mt-2">Thank you for bringing this to our attention. Our team will review your report and take appropriate action as soon as possible.</p>
                                        <p className="mt-2">If necessary, we may contact you for additional information using the email address you provided.</p>
                                        <button
                                            onClick={() => setSubmitStatus('idle')}
                                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Submit another report
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    Your Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[#333333] rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[#333333] rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <CustomSelect
                                                id="contentType"
                                                name="contentType"
                                                label="Type of Content"
                                                value={formData.contentType}
                                                onChange={handleSelectChange('contentType')}
                                                options={contentTypeOptions}
                                                required
                                                placeholder="Please select"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                                URL or Location of Content
                                            </label>
                                            <input
                                                type="text"
                                                id="url"
                                                name="url"
                                                value={formData.url}
                                                onChange={handleChange}
                                                required
                                                placeholder="https://example.com/page-with-content"
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[#333333] rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Details of the Report
                                            </label>
                                            <textarea
                                                id="details"
                                                name="details"
                                                rows={5}
                                                value={formData.details}
                                                onChange={handleChange}
                                                required
                                                placeholder="Please provide specific details about why this content is illegal or harmful"
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-[#333333] rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div className="bg-gray-50 dark:bg-[#1E1E1E] p-4 rounded-lg border border-gray-200 dark:border-[#333333]">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                By submitting this report, you acknowledge that all information provided is accurate to the best of your knowledge. False reports may result in account restrictions.
                                            </p>
                                        </div>

                                        <div>
                                            <button
                                                type="submit"
                                                disabled={submitStatus === 'submitting'}
                                                className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${submitStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {submitStatus === 'submitting' ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit Report'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 