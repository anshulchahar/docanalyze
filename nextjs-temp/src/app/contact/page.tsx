'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import CustomSelect, { SelectOption } from '@/components/CustomSelect';
import ValidatedInput from '@/components/ValidatedInput';
import ErrorMessage from '@/components/ErrorMessage';

export default function ContactPage() {
    const { isOpen } = useSidebar();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [formErrors, setFormErrors] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    const subjectOptions: SelectOption[] = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'support', label: 'Technical Support' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'billing', label: 'Billing Question' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Mark field as touched
        if (!touchedFields[name]) {
            setTouchedFields(prev => ({ ...prev, [name]: true }));
        }

        // Clear error when user types
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name } = e.target;

        // Mark field as touched
        setTouchedFields(prev => ({ ...prev, [name]: true }));

        // Validate field on blur
        validateField(name, formData[name as keyof typeof formData]);
    };

    const validateField = (name: string, value: string) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    error = 'Name is required';
                } else if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                if (!value.trim()) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'subject':
                if (!value) {
                    error = 'Please select a subject';
                }
                break;
            case 'message':
                if (!value.trim()) {
                    error = 'Message is required';
                } else if (value.trim().length < 10) {
                    error = 'Message must be at least 10 characters';
                }
                break;
            default:
                break;
        }

        setFormErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const validateForm = () => {
        // Mark all fields as touched
        const allFields = { name: true, email: true, subject: true, message: true };
        setTouchedFields(allFields);

        // Validate all fields
        let isValid = true;
        Object.entries(formData).forEach(([name, value]) => {
            const fieldValid = validateField(name, value);
            if (!fieldValid) isValid = false;
        });

        return isValid;
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        // Mark field as touched
        setTouchedFields(prev => ({ ...prev, [name]: true }));

        // Validate select field
        validateField(name, value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields before submitting
        if (!validateForm()) {
            return;
        }

        setSubmitStatus('submitting');

        // Simulate form submission
        setTimeout(() => {
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
            // Reset touched fields
            setTouchedFields({});
        }, 1500);
    };

    const contactMethods = [
        {
            icon: <EnvelopeIcon className="h-6 w-6" />,
            title: 'Email',
            description: 'support@docanalyze.example.com',
            detail: 'We&apos;ll respond within 24 hours'
        },
        {
            icon: <PhoneIcon className="h-6 w-6" />,
            title: 'Phone',
            description: '+1 (555) 123-4567',
            detail: 'Monday-Friday, 9AM-5PM ET'
        },
        {
            icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
            title: 'Live Chat',
            description: 'Available on our website',
            detail: 'During business hours'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] transition-colors duration-200">
            <Navigation history={[]} />

            <div className={`pt-16 pb-8 w-full transition-all duration-300 ease-in-out ${isOpen ? 'pl-64' : 'pl-16'}`}>
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full">
                    <div className="mx-auto w-full max-w-5xl">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Contact Methods */}
                            <div className="w-full md:w-1/3">
                                <div className="bg-white dark:bg-[#2C2C2C] border dark:border-[#333333] rounded-lg shadow-lg p-6 sticky top-24">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
                                    <div className="space-y-6">
                                        {contactMethods.map((method, index) => (
                                            <div key={index} className="flex items-start">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                                                    {method.icon}
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{method.title}</h3>
                                                    <p className="mt-1 text-gray-700 dark:text-gray-200">{method.description}</p>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{method.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-[#333333]">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Follow Us</h3>
                                        <div className="flex space-x-4">
                                            <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                                <span className="sr-only">Twitter</span>
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                                </svg>
                                            </a>
                                            <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                                <span className="sr-only">GitHub</span>
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                            <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                                <span className="sr-only">LinkedIn</span>
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="w-full md:w-2/3">
                                <div className="bg-white dark:bg-[#2C2C2C] border dark:border-[#333333] rounded-lg shadow-lg p-6 mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h1>

                                    <div className="space-y-6">
                                        <div className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                                            <p>
                                                Have questions or need assistance? Fill out the form below and our support team will get back to you as soon as possible.
                                            </p>
                                        </div>

                                        {submitStatus === 'success' ? (
                                            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-6 rounded-lg border border-green-200 dark:border-green-800/30">
                                                <h3 className="text-lg font-medium">Message sent successfully!</h3>
                                                <p className="mt-2">Thank you for contacting us. We&apos;ll get back to you as soon as possible.</p>
                                                <button
                                                    onClick={() => setSubmitStatus('idle')}
                                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                                >
                                                    Send another message
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                    <ValidatedInput
                                                        label="Your Name"
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touchedFields.name ? formErrors.name : ''}
                                                        required
                                                        placeholder="John Doe"
                                                        helpText="Enter your full name"
                                                        className="px-4 py-3 bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white transition-colors"
                                                    />

                                                    <ValidatedInput
                                                        label="Email Address"
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={touchedFields.email ? formErrors.email : ''}
                                                        required
                                                        placeholder="john@example.com"
                                                        helpText="We'll never share your email"
                                                        className="px-4 py-3 bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <CustomSelect
                                                        id="subject"
                                                        name="subject"
                                                        label="Subject"
                                                        value={formData.subject}
                                                        onChange={handleSelectChange('subject')}
                                                        options={subjectOptions}
                                                        required
                                                        placeholder="Please select"
                                                    />
                                                    {touchedFields.subject && formErrors.subject && (
                                                        <ErrorMessage message={formErrors.subject} className="mt-1" />
                                                    )}
                                                </div>

                                                <div>
                                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                                        Message <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        id="message"
                                                        name="message"
                                                        rows={5}
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        required
                                                        placeholder="How can we help you?"
                                                        className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none bg-white dark:bg-[#3A3A3A] text-gray-900 dark:text-white transition-colors ${touchedFields.message && formErrors.message
                                                            ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
                                                            : 'border-gray-300 dark:border-[#333333] focus:ring-primary focus:border-primary'
                                                            }`}
                                                    />
                                                    {touchedFields.message && formErrors.message && (
                                                        <ErrorMessage message={formErrors.message} className="mt-1" />
                                                    )}
                                                </div>

                                                <div>
                                                    <button
                                                        type="submit"
                                                        disabled={submitStatus === 'submitting'}
                                                        className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${submitStatus === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    >
                                                        {submitStatus === 'submitting' ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            'Send Message'
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
            </div>
        </div>
    );
} 