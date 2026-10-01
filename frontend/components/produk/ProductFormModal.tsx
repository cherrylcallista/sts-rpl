'use client';
import type { FormEvent } from 'react';
import type { Kategori, Produk } from '@/types';
import { X } from 'lucide-react';

export interface ProdukFormData {
  id_kategori: string;
  kode_produk: string;
  nama_produk: string;
  harga: string;
  stok: string;
  deskripsi: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  product: Produk | null;
  categories: Kategori[];
  formData: ProdukFormData;
  onFormDataChange: (formData: ProdukFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export default function ProductFormModal({
  isOpen,
  product,
  categories,
  formData,
  onFormDataChange,
  onSubmit,
  onClose,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  const updateField = (field: keyof ProdukFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{product ? 'Ubah Data Produk' : 'Tambah Produk Baru'}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-code" className="mb-1 block text-xs font-semibold text-gray-700">
                Kode Menu *
              </label>
              <input
                id="product-code"
                type="text"
                required
                value={formData.kode_produk}
                onChange={(event) => updateField('kode_produk', event.target.value)}
                placeholder="PRD-011"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="product-category" className="mb-1 block text-xs font-semibold text-gray-700">
                Kategori *
              </label>
              <select
                id="product-category"
                required
                value={formData.id_kategori}
                onChange={(event) => updateField('id_kategori', event.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id_kategori} value={category.id_kategori}>
                    {category.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="product-name" className="mb-1 block text-xs font-semibold text-gray-700">
              Nama Produk *
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={formData.nama_produk}
              onChange={(event) => updateField('nama_produk', event.target.value)}
              placeholder="Contoh: Bebek Goreng Kremes"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-price" className="mb-1 block text-xs font-semibold text-gray-700">
                Harga (Rp) *
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                required
                value={formData.harga}
                onChange={(event) => updateField('harga', event.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="product-stock" className="mb-1 block text-xs font-semibold text-gray-700">
                Stok Awal *
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                required
                value={formData.stok}
                onChange={(event) => updateField('stok', event.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-description" className="mb-1 block text-xs font-semibold text-gray-700">
              Deskripsi Tambahan
            </label>
            <textarea
              id="product-description"
              rows={3}
              value={formData.deskripsi}
              onChange={(event) => updateField('deskripsi', event.target.value)}
              placeholder="Keterangan porsi, bahan, atau kepedasan..."
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}