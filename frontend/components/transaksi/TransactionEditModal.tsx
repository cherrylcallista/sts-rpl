'use client';
import type { FormEvent } from 'react';
import type { DetailTransaksi, ItemTransaksi, Produk } from '@/types';
import { Plus, Save, Trash2, X } from 'lucide-react';

interface TransactionEditModalProps {
  transaction: DetailTransaksi | null;
  products: Produk[];
  customerName: string;
  items: ItemTransaksi[];
  selectedProductId: string;
  saving: boolean;
  onCustomerNameChange: (value: string) => void;
  onSelectedProductChange: (value: string) => void;
  onAddProduct: () => void;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemoveProduct: (productId: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

function formatRupiah(value: number) {
  return `Rp ${Number(value).toLocaleString('id-ID')}`;
}

export default function TransactionEditModal({
  transaction,
  products,
  customerName,
  items,
  selectedProductId,
  saving,
  onCustomerNameChange,
  onSelectedProductChange,
  onAddProduct,
  onQuantityChange,
  onRemoveProduct,
  onSubmit,
  onClose,
}: TransactionEditModalProps) {
  if (!transaction) return null;

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-100 bg-white p-5 shadow-xl sm:p-6">
        <header className="mb-5 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-gray-900">Edit Transaksi</h3>
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="transaction-customer" className="mb-1 block text-xs font-semibold text-gray-700">
              Nama Pelanggan
            </label>
            <input
              id="transaction-customer"
              required
              value={customerName}
              onChange={(event) => onCustomerNameChange(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedProductId}
              onChange={(event) => onSelectedProductChange(event.target.value)}
              className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Pilih produk untuk ditambahkan</option>
              {products.map((product) => (
                <option key={product.id_produk} value={product.id_produk}>
                  {product.nama_produk} - {formatRupiah(Number(product.harga))}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onAddProduct}
              disabled={!selectedProductId}
              className="inline-flex items-center justify-center gap-2 rounded bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Tambah Produk
            </button>
          </div>

          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2">Produk</th>
                  <th className="px-3 py-2">Harga</th>
                  <th className="px-3 py-2">Jumlah</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                  <th className="px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-5 text-center text-gray-400">
                      Tambahkan minimal satu produk.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id_produk}>
                      <td className="px-3 py-2">{item.nama_produk}</td>
                      <td className="whitespace-nowrap px-3 py-2">{formatRupiah(item.harga)}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.jumlah}
                          onChange={(event) => onQuantityChange(item.id_produk, Number(event.target.value))}
                          className="w-20 rounded border border-gray-300 px-2 py-1"
                          aria-label={`Jumlah ${item.nama_produk}`}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        {formatRupiah(item.subtotal)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveProduct(item.id_produk)}
                          className="rounded p-1.5 text-rose-600 hover:bg-rose-50"
                          title="Hapus item"
                          aria-label={`Hapus ${item.nama_produk}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm text-gray-600">Total baru</span>
            <strong className="text-lg text-amber-700">{formatRupiah(total)}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || items.length === 0}
              className="inline-flex items-center gap-2 rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Simpan Perubahan
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
