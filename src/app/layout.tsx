import type { Metadata } from 'next';
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const newsreader = Newsreader({
  variable: '--font-serif',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VERITY — Public Claim Intelligence & Evidence Repository',
  description:
    'Search public statements, track how they change over time, inspect historical diffs, and explore the evidence behind them.',
  keywords: [
    'public claim intelligence',
    'version-controlled statements',
    'SEBI caution notices',
    'RBI unauthorized forex alert list',
    'financial fraud research India',
    'investor protection records'
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F6F8F7] text-[#141A17] font-sans selection:bg-[#E6F2F2] selection:text-[#044C4C]">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
