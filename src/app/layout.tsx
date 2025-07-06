import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CreativeWorkshopProvider } from '@/contexts/CreativeWorkshopContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Crystal Visions AI',
  description: 'AI-powered crystal jewelry design platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <CreativeWorkshopProvider>
              <AppLayout>
                <ErrorBoundary>
                {children}
                </ErrorBoundary>
              </AppLayout>
              <Toaster />
            </CreativeWorkshopProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
