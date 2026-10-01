import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Food Order System - STS RPL',
  description: 'Sistem Informasi Pemesanan Makanan Terintegrasi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-800 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}