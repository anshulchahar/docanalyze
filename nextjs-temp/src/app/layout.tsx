import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import Navigation from '@/components/Navigation';
import ErrorBoundary from '@/components/ErrorBoundary';

const geist = Geist({
  subsets: ["latin"],
});

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
      <body className={geist.className}>
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
