import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import SyncStatus from '@/components/sync-status';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CT JALAPA',
  description: 'Sistema de registro de matrículas para el CETA de Jalapa',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#29ABE2" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
      </head>
      <body className={cn('font-body antialiased h-full bg-background', inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Aquí solo deben estar los hijos y los proveedores globales */}
          <Analytics/>
          {children}
          <Toaster />
          <SyncStatus />
        </ThemeProvider>
      </body>
    </html>
  );
}