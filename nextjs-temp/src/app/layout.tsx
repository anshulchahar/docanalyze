import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from './providers';
import Navigation from '@/components/Navigation';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: "DocAnalyze - AI Document Analysis",
  description: "Analyze your documents with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <ErrorBoundary>
          <Providers>
            <Navigation />
            <main>{children}</main>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
