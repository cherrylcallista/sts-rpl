'use client';
import { useState, useEffect, type FormEvent } from 'react';
import type { Produk, Kategori } from '@/types';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import ProductDetailModal from '@/components/produk/ProductDetailModal';
import ProductFormModal, { type ProdukFormData } from '@/components/produk/ProductFormModal';
import ProductTable from '@/components/produk/ProductTable';
import { Search, Plus } from 'lucide-react';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function fetchProdukList(search: string, kategoriFilter: string, signal?: AbortSignal): Promise<Produk[]> {
  const query = new URLSearchParams();
  if (search) query.append('search', search);
  if (kategoriFilter) query.append('kategori', kategoriFilter);

  const res = await fetch(`/api/produk?${query.toString()}`, { signal });
  if (!res.ok) throw new Error('Gagal memuat daftar produk.');
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('Format data produk tidak valid.');
  return data;
}

export default function ProdukPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [formData, setFormData] = useState<ProdukFormData>({
    id_kategori: '',
    kode_produk: '',
    nama_produk: '',
    harga: '',
    stok: '',
    deskripsi: '',
  });

  const refreshProduk = async () => {
    try {
      setProdukList(await fetchProdukList(search, kategoriFilter));
    } catch (error: unknown) {
      setToast({ type: 'error', message: getErrorMessage(error, 'Gagal memuat daftar produk.') });
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/kategori')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat daftar kategori.');
        return res.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('Format data kategori tidak valid.');
        if (!cancelled) setKategoriList(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setToast({ type: 'error', message: getErrorMessage(error, 'Gagal memuat daftar kategori.') });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProdukList(search, kategoriFilter, controller.signal)
      .then(setProdukList)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setToast({ type: 'error', message: getErrorMessage(error, 'Gagal memuat daftar produk.') });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search, kategoriFilter]);

  const openAddModal = () => {
    setSelectedProduk(null);
    setFormData({ id_kategori: '', kode_produk: '', nama_produk: '', harga: '', stok: '', deskripsi: '' });
    setIsFormOpen(true);
  };

  const openEditModal = (p: Produk) => {
    setSelectedProduk(p);
    setFormData({
      id_kategori: String(p.id_kategori),
      kode_produk: p.kode_produk,
      nama_produk: p.nama_produk,
      harga: String(p.harga),
      stok: String(p.stok),
      deskripsi: p.deskripsi || '',
    });
    setIsFormOpen(true);
  };

  const openDetailModal = (p: Produk) => {
    setSelectedProduk(p);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isEdit = !!selectedProduk;
    const url = isEdit ? `/api/produk/${selectedProduk.id_produk}` : '/api/produk';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const resData = await res.json();

      if (!res.ok) throw new Error(resData.message || 'Terjadi kesalahan sistem.');

      setToast({ type: 'success', message: resData.message });
      setIsFormOpen(false);
      void refreshProduk();
    } catch (error: unknown) {
      setToast({ type: 'error', message: getErrorMessage(error, 'Terjadi kesalahan sistem.') });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/produk/${deleteId}`, { method: 'DELETE' });
      const resData = await res.json();

      if (!res.ok) throw new Error(resData.message || 'Gagal menghapus produk.');

      setToast({ type: 'success', message: resData.message });
      void refreshProduk();
    } catch (error: unknown) {
      setToast({ type: 'error', message: getErrorMessage(error, 'Gagal menghapus produk.') });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Produk</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola daftar menu makanan, stok sisa, dan informasi harga.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Tambah Menu Baru
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama atau kode..."
            value={search}
            onChange={(e) => {
              setLoading(true);
              setSearch(e.target.value);
            }}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        <select
          value={kategoriFilter}
          onChange={(e) => {
            setLoading(true);
            setKategoriFilter(e.target.value);
          }}
          className="w-full md:w-60 px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
        >
          <option value="">Semua Kategori</option>
          {kategoriList.map((k) => (
            <option key={k.id_kategori} value={k.id_kategori}>
              {k.nama_kategori}
            </option>
          ))}
        </select>
      </div>

      <ProductTable
        products={produkList}
        loading={loading}
        onView={openDetailModal}
        onEdit={openEditModal}
        onDelete={(product) => setDeleteId(product.id_produk)}
      />

      <ProductFormModal
        isOpen={isFormOpen}
        product={selectedProduk}
        categories={kategoriList}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleFormSubmit}
        onClose={() => setIsFormOpen(false)}
      />

      <ProductDetailModal
        isOpen={isDetailOpen}
        product={selectedProduk}
        onClose={() => setIsDetailOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Hapus Menu Produk"
        message="Apakah Anda yakin ingin menghapus produk ini dari database? Aksi ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: null, message: '' })} />
    </div>
  );
}