'use client';
import type { DetailTransaksi } from '@/types';
import { X } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: DetailTransaksi | null;
  onClose: () => void;
}

function formatRupiah(value: number) {
  return `Rp ${Number(value).toLocaleString('id-ID')}`;
}

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-100 bg-white p-5 shadow-xl sm:p-6">
        <header className="mb-5 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-gray-900">Detail Transaksi</h3>
            <p className="mt-1 font-mono text-xs text-gray-500">{transaction.kode_transaksi}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Pelanggan</dt>
              <dd className="font-medium text-gray-900">{transaction.nama_pelanggan}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Tanggal</dt>
              <dd className="font-medium text-gray-900">
                {new Date(transaction.tanggal_transaksi).toLocaleString('id-ID')}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium text-gray-900">{transaction.status}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Total Pembayaran</dt>
              <dd className="font-bold text-amber-700">{formatRupiah(transaction.total_bayar)}</dd>
            </div>
          </dl>

          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2">Produk</th>
                  <th className="px-3 py-2">Harga</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transaction.items.map((item) => (
                  <tr key={item.id_produk}>
                    <td className="px-3 py-2">{item.nama_produk}</td>
                    <td className="whitespace-nowrap px-3 py-2">{formatRupiah(item.harga)}</td>
                    <td className="px-3 py-2">{item.jumlah}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">{formatRupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
