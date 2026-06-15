import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'FreelanceFlow', template: '%s | FreelanceFlow' },
  description: 'The all-in-one freelance business management platform for independent professionals.',
  keywords: ['freelance', 'invoices', 'time tracking', 'clients', 'proposals'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
