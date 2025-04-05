import { Metadata } from 'next';

const metadata: Metadata = {
    title: {
        default: 'DocAnalyze - AI Document Analysis',
        template: '%s | DocAnalyze',
    },
    description: 'AI-powered document analysis tool for extracting insights from PDF documents',
    keywords: ['PDF analysis', 'AI document analysis', 'text extraction', 'document comparison', 'Gemini AI'],
    authors: [{ name: 'DocAnalyze Team' }],
    creator: 'DocAnalyze',
    publisher: 'DocAnalyze',
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://docanalyze.vercel.app',
        siteName: 'DocAnalyze',
        title: 'DocAnalyze - AI Document Analysis',
        description: 'AI-powered document analysis tool for extracting insights from PDF documents',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'DocAnalyze - AI Document Analysis',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DocAnalyze - AI Document Analysis',
        description: 'AI-powered document analysis tool for extracting insights from PDF documents',
        images: ['/og-image.png'],
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
        other: [
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                url: '/favicon-32x32.png',
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                url: '/favicon-16x16.png',
            },
        ],
    },
    manifest: '/site.webmanifest',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
    },
    themeColor: '#ffffff',
};

export default metadata;