import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from '@/app/providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SidebarProvider } from '@/contexts/SidebarContext';

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
    <html lang="en" className="light">
      <body className={GeistSans.className}>
        <SidebarProvider>
          <ErrorBoundary>
            <Providers>
              <main>{children}</main>
            </Providers>
          </ErrorBoundary>
        </SidebarProvider>
      </body>
    </html>
  );
}
