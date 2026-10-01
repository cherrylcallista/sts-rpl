'use client';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, DollarSign, Package, ShoppingCart } from 'lucide-react';

interface DashboardMetricsProps {
  totalPendapatan: number;
  totalTransaksi: number;
  totalProduk: number;
  stokMenipis: number;
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

function MetricCard({ label, value, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardMetrics({
  totalPendapatan,
  totalTransaksi,
  totalProduk,
  stokMenipis,
}: DashboardMetricsProps) {
  const metrics: MetricCardProps[] = [
    {
      label: 'Total Pendapatan',
      value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Jumlah Transaksi',
      value: `${totalTransaksi} Trx`,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Menu/Produk',
      value: `${totalProduk} Item`,
      icon: Package,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Stok Rendah (≤ 5)',
      value: `${stokMenipis} Perlu Restok`,
      icon: AlertCircle,
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
