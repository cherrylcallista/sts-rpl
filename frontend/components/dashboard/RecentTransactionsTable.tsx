'use client';
import type { Transaksi } from '@/types';
import { ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

interface RecentTransactionsTableProps {
  transactions: Transaksi[];
}

export default function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900">5 Transaksi Terakhir</h3>
        <Link
          href="/transaksi/baru"
          className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          Buat Transaksi Baru <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
            <tr>
              <th className="whitespace-nowrap px-5 py-3">Kode Transaksi</th>
              <th className="px-5 py-3">Pelanggan</th>
              <th className="whitespace-nowrap px-5 py-3">Waktu</th>
              <th className="whitespace-nowrap px-5 py-3">Total Pembayaran</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id_transaksi} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-5 py-3 font-mono font-medium text-gray-900">
                    {transaction.kode_transaksi}
                  </td>
                  <td className="px-5 py-3">{transaction.nama_pelanggan}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                    {new Date(transaction.tanggal_transaksi).toLocaleString('id-ID')}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">
                    Rp {transaction.total_bayar.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      href={`/transaksi?detail=${transaction.id_transaksi}`}
                      className="inline-flex rounded p-2 text-blue-600 hover:bg-blue-50"
                      aria-label={`Lihat detail ${transaction.kode_transaksi}`}
                      title="Lihat detail transaksi"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">
                  Belum ada transaksi tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
