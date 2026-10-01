'use client';
import type { Transaksi } from '@/types';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaksi[];
  loading: boolean;
  emptyMessage?: string;
  onView: (transaction: Transaksi) => void;
  onEdit: (transaction: Transaksi) => void;
  onDelete: (transaction: Transaksi) => void;
}

export default function TransactionTable({
  transactions,
  loading,
  emptyMessage = 'Belum ada transaksi tercatat.',
  onView,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
            <tr>
              <th className="whitespace-nowrap px-5 py-3">Kode Transaksi</th>
              <th className="px-5 py-3">Pelanggan</th>
              <th className="whitespace-nowrap px-5 py-3">Waktu</th>
              <th className="whitespace-nowrap px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">Memuat transaksi...</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">{emptyMessage}</td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id_transaksi} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-5 py-3 font-mono font-medium text-gray-900">
                    {transaction.kode_transaksi}
                  </td>
                  <td className="px-5 py-3 text-gray-700">{transaction.nama_pelanggan}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                    {new Date(transaction.tanggal_transaksi).toLocaleString('id-ID')}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">
                    Rp {transaction.total_bayar.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      transaction.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : transaction.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView(transaction)}
                        className="rounded p-2 text-blue-600 hover:bg-blue-50"
                        title="Lihat detail"
                        aria-label={`Lihat detail ${transaction.kode_transaksi}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(transaction)}
                        className="rounded p-2 text-amber-600 hover:bg-amber-50"
                        title="Edit transaksi"
                        aria-label={`Edit ${transaction.kode_transaksi}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(transaction)}
                        className="rounded p-2 text-rose-600 hover:bg-rose-50"
                        title="Hapus transaksi"
                        aria-label={`Hapus ${transaction.kode_transaksi}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
