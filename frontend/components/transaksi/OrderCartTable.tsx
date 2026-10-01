'use client';
import { Trash2 } from 'lucide-react';

export interface CartItem {
  id_produk: number;
  nama_produk: string;
  harga: number;
  stok_tersedia: number;
  jumlah: number;
  subtotal: number;
}

interface OrderCartTableProps {
  items: CartItem[];
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

function formatRupiah(value: number) {
  return `Rp ${Number(value).toLocaleString('id-ID')}`;
}

export default function OrderCartTable({ items, onQuantityChange, onRemoveItem }: OrderCartTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="mt-2 w-full text-left text-sm">
        <thead className="border-y bg-gray-50 font-semibold text-gray-600">
          <tr>
            <th className="px-3 py-2.5">Nama Menu</th>
            <th className="px-3 py-2.5">Harga</th>
            <th className="w-28 px-3 py-2.5">Kuantitas</th>
            <th className="px-3 py-2.5">Subtotal</th>
            <th className="px-3 py-2.5 text-center">Batal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-400">
                Belum ada item pesanan yang dipilih.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id_produk}>
                <td className="px-3 py-3 font-medium text-gray-900">{item.nama_produk}</td>
                <td className="whitespace-nowrap px-3 py-3 text-gray-600">{formatRupiah(item.harga)}</td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    max={item.stok_tersedia}
                    value={item.jumlah}
                    onChange={(event) => onQuantityChange(item.id_produk, Number(event.target.value))}
                    className="w-20 rounded border px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    aria-label={`Kuantitas ${item.nama_produk}`}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-900">
                  {formatRupiah(item.subtotal)}
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id_produk)}
                    className="text-rose-500 hover:text-rose-700"
                    title="Hapus item"
                    aria-label={`Hapus ${item.nama_produk}`}
                  >
                    <Trash2 className="mx-auto h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
