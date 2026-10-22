import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CreatorTask - Platform Manajemen Kampanye & Invoice Kreator',
  description: 'Aplikasi Manajemen Kerja Sama Kampanye, Invoice, dan Keuangan untuk Content Creator & Affiliator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
