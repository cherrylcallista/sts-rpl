'use client';
import type { Produk } from '@/types';
import { X } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  product: Produk | null;
  onClose: () => void;
}

export default function ProductDetailModal({ isOpen, product, onClose }: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const details = [
    { label: 'Kode Menu', value: product.kode_produk, className: 'font-mono font-bold' },
    { label: 'Nama Produk', value: product.nama_produk, className: 'font-semibold' },
    { label: 'Kategori', value: product.nama_kategori || '-' },
    { label: 'Harga Satuan', value: `Rp ${product.harga.toLocaleString('id-ID')}`, className: 'font-semibold text-amber-600' },
    { label: 'Sisa Stok', value: `${product.stok} unit`, className: 'font-semibold' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-gray-900">Rincian Informasi Menu</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          {details.map((detail) => (
            <div key={detail.label} className="flex justify-between gap-4 border-b py-1">
              <dt className="text-gray-500">{detail.label}</dt>
              <dd className={`text-right text-gray-800 ${detail.className || ''}`}>{detail.value}</dd>
            </div>
          ))}
          <div className="pt-1">
            <dt className="mb-1 text-gray-500">Deskripsi</dt>
            <dd className="rounded-lg border bg-gray-50 p-2.5 text-xs text-gray-700">
              {product.deskripsi || 'Tidak ada deskripsi.'}
            </dd>
          </div>
        </dl>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}