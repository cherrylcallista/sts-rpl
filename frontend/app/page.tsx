'use client';
import { useEffect, useState } from 'react';
import type { RingkasanDashboard } from '@/types';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable';

export default function DashboardPage() {
  const [data, setData] = useState<RingkasanDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ringkasan')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat rekapitulasi data...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Ringkasan Sistem & Laporan</h2>
        <p className="text-gray-500 text-sm mt-1">Pantau kinerja penjualan, sirkulasi stok, dan aktivitas pesanan terkini.</p>
      </div>

      <DashboardMetrics
        totalPendapatan={data?.totalPendapatan || 0}
        totalTransaksi={data?.totalTransaksi || 0}
        totalProduk={data?.totalProduk || 0}
        stokMenipis={data?.stokMenipis || 0}
      />
      <RecentTransactionsTable transactions={data?.transaksiTerbaru || []} />
    </div>
  );
}