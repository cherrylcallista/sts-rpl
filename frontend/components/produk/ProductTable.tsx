'use client';
import type { Produk } from '@/types';
import { Edit2, Eye, Trash2 } from 'lucide-react';

interface ProductTableProps {
  products: Produk[];
  loading: boolean;
  onView: (product: Produk) => void;
  onEdit: (product: Produk) => void;
  onDelete: (product: Produk) => void;
}

export default function ProductTable({ products, loading, onView, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
            <tr>
              <th className="px-5 py-3">Kode</th>
              <th className="px-5 py-3">Nama Menu</th>
              <th className="px-5 py-3">Kategori</th>
              <th className="whitespace-nowrap px-5 py-3">Harga Satuan</th>
              <th className="px-5 py-3">Stok</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">Memuat data...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">Tidak ada menu produk yang sesuai.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id_produk} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-medium text-gray-900">{product.kode_produk}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{product.nama_produk}</td>
                  <td className="px-5 py-3 text-gray-600">{product.nama_kategori}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-900">Rp {product.harga.toLocaleString('id-ID')}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.stok <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.stok} porsi
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(product)}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                        title="Detail"
                        aria-label={`Detail ${product.nama_produk}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="rounded p-1.5 text-amber-600 hover:bg-amber-50"
                        title="Edit"
                        aria-label={`Edit ${product.nama_produk}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="rounded p-1.5 text-rose-600 hover:bg-rose-50"
                        title="Hapus"
                        aria-label={`Hapus ${product.nama_produk}`}
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