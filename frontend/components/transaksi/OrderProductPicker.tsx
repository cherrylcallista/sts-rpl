'use client';
import type { Produk } from '@/types';
import { Plus, ShoppingBag } from 'lucide-react';

interface OrderProductPickerProps {
  products: Produk[];
  selectedProductId: string;
  onProductChange: (productId: string) => void;
  onAddProduct: () => void;
}

export default function OrderProductPicker({
  products,
  selectedProductId,
  onProductChange,
  onAddProduct,
}: OrderProductPickerProps) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 border-b pb-2 font-semibold text-gray-900">
        <ShoppingBag className="h-5 w-5 text-amber-500" /> Pilih Menu Pesanan
      </h3>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={selectedProductId}
          onChange={(event) => onProductChange(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">-- Pilih Menu Tersedia --</option>
          {products.map((product) => (
            <option key={product.id_produk} value={product.id_produk}>
              {product.nama_produk} - Rp {product.harga.toLocaleString('id-ID')} (Stok: {product.stok})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAddProduct}
          disabled={!selectedProductId}
          className="flex items-center justify-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Masukkan
        </button>
      </div>
    </section>
  );
}
