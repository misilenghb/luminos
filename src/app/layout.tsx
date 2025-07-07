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
  title: '水晶日历 - 身心灵能量管理',
  description: '基于MBTI和脉轮分析的个性化能量管理应用，帮助你更好地了解自己，优化日常生活节奏',
  keywords: ['能量管理', 'MBTI', '脉轮', '水晶', '冥想', '个人成长', '身心灵'],
  authors: [{ name: '水晶日历团队' }],
  creator: '水晶日历',
  publisher: '水晶日历',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '水晶日历',
  },
  openGraph: {
    type: 'website',
    siteName: '水晶日历',
    title: '水晶日历 - 身心灵能量管理',
    description: '基于MBTI和脉轮分析的个性化能量管理应用',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '水晶日历 - 身心灵能量管理',
    description: '基于MBTI和脉轮分析的个性化能量管理应用',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: '#8b5cf6',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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

        {/* PWA相关meta标签 */}
        <meta name="application-name" content="水晶日历" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="水晶日历" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* 图标 */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#8b5cf6" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* 启动画面 */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-startup-image" href="/apple-splash-2048-2732.jpg" sizes="2048x2732" />
        <link rel="apple-touch-startup-image" href="/apple-splash-1668-2224.jpg" sizes="1668x2224" />
        <link rel="apple-touch-startup-image" href="/apple-splash-1536-2048.jpg" sizes="1536x2048" />
        <link rel="apple-touch-startup-image" href="/apple-splash-1125-2436.jpg" sizes="1125x2436" />
        <link rel="apple-touch-startup-image" href="/apple-splash-1242-2208.jpg" sizes="1242x2208" />
        <link rel="apple-touch-startup-image" href="/apple-splash-750-1334.jpg" sizes="750x1334" />
        <link rel="apple-touch-startup-image" href="/apple-splash-640-1136.jpg" sizes="640x1136" />
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
              <div suppressHydrationWarning>
                <Toaster />
              </div>
            </CreativeWorkshopProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
