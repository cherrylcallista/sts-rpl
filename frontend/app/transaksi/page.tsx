'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { DetailTransaksi, ItemTransaksi, Produk, Transaksi } from '@/types';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import TransactionDetailModal from '@/components/transaksi/TransactionDetailModal';
import TransactionEditModal from '@/components/transaksi/TransactionEditModal';
import TransactionTable from '@/components/transaksi/TransactionTable';
import { Search } from 'lucide-react';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function fetchTransactionDetail(transactionId: number): Promise<DetailTransaksi> {
  const response = await fetch(`/api/transaksi/${transactionId}`);
  const data: unknown = await response.json();
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || 'Gagal memuat detail transaksi.');
  }
  return data as DetailTransaksi;
}

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<DetailTransaksi | null>(null);
  const [modalMode, setModalMode] = useState<'detail' | 'edit' | null>(null);
  const [products, setProducts] = useState<Produk[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<ItemTransaksi[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Transaksi | null>(null);
  const [saving, setSaving] = useState(false);
  const dashboardDetailHandled = useRef(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const refreshTransactions = useCallback(async () => {
    const response = await fetch('/api/transaksi');
    const data: unknown = await response.json();
    if (!response.ok) throw new Error((data as { message?: string }).message || 'Gagal memuat daftar transaksi.');
    if (!Array.isArray(data)) throw new Error('Format daftar transaksi tidak valid.');
    setTransactions(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/transaksi')
      .then(async (response) => {
        const data: unknown = await response.json();
        if (!response.ok) throw new Error((data as { message?: string }).message || 'Gagal memuat transaksi.');
        if (!Array.isArray(data)) throw new Error('Format daftar transaksi tidak valid.');
        if (!cancelled) setTransactions(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setToast({ type: 'error', message: getErrorMessage(error, 'Gagal memuat transaksi.') });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openTransaction = useCallback(async (transactionId: number, mode: 'detail' | 'edit') => {
    try {
      const detail = await fetchTransactionDetail(transactionId);
      let productList: Produk[] = [];
      if (mode === 'edit') {
        const response = await fetch('/api/produk');
        const productData: unknown = await response.json();
        if (!response.ok || !Array.isArray(productData)) {
          throw new Error('Gagal memuat daftar produk.');
        }
        productList = productData;
      }
      setProducts(productList);
      setSelectedTransaction(detail);
      setCustomerName(detail.nama_pelanggan);
      setItems(detail.items);
      setModalMode(mode);
    } catch (error: unknown) {
      setModalMode(null);
      setToast({ type: 'error', message: getErrorMessage(error, 'Gagal membuka transaksi.') });
    }
  }, []);

  useEffect(() => {
    if (loading || dashboardDetailHandled.current) return;
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.has('detail')) return;
    const transactionId = Number(searchParams.get('detail'));
    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) return;
    dashboardDetailHandled.current = true;
    let cancelled = false;
    const loadDashboardDetail = async () => {
      try {
        const detail = await fetchTransactionDetail(transactionId);
        if (cancelled) return;
        setSelectedTransaction(detail);
        setCustomerName(detail.nama_pelanggan);
        setItems(detail.items);
        setModalMode('detail');
      } catch (error: unknown) {
        if (!cancelled) setToast({ type: 'error', message: getErrorMessage(error, 'Gagal membuka transaksi.') });
      }
    };
    void loadDashboardDetail();
    return () => {
      cancelled = true;
    };
  }, [loading]);

  const addItem = () => {
    const product = products.find((entry) => entry.id_produk === Number(selectedProductId));
    if (!product) return;
    if (items.some((item) => item.id_produk === product.id_produk)) {
      setToast({ type: 'error', message: 'Produk sudah ada dalam transaksi.' });
      return;
    }
    setItems((current) => [
      ...current,
      { id_produk: product.id_produk, nama_produk: product.nama_produk, harga: Number(product.harga), jumlah: 1, subtotal: Number(product.harga) },
    ]);
    setSelectedProductId('');
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id_produk !== productId) return item;
        const safeQuantity = Math.max(1, Number.isSafeInteger(quantity) ? quantity : 1);
        return { ...item, jumlah: safeQuantity, subtotal: item.harga * safeQuantity };
      })
    );
  };

  const saveTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTransaction) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/transaksi/${selectedTransaction.id_transaksi}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_pelanggan: customerName,
          items: items.map(({ id_produk, jumlah }) => ({ id_produk, jumlah })),
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error((data as { message?: string }).message || 'Gagal memperbarui transaksi.');
      setToast({ type: 'success', message: (data as { message: string }).message });
      setModalMode(null);
      await refreshTransactions();
    } catch (error: unknown) {
      setToast({ type: 'error', message: getErrorMessage(error, 'Gagal memperbarui transaksi.') });
    } finally {
      setSaving(false);
    }
  };

  const deleteTransaction = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/transaksi/${deleteTarget.id_transaksi}`, { method: 'DELETE' });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error((data as { message?: string }).message || 'Gagal menghapus transaksi.');
      setToast({ type: 'success', message: (data as { message: string }).message });
      await refreshTransactions();
    } catch (error: unknown) {
      setToast({ type: 'error', message: getErrorMessage(error, 'Gagal menghapus transaksi.') });
    } finally {
      setDeleteTarget(null);
    }
  };

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase('id-ID');
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionCode = transaction.kode_transaksi.toLocaleLowerCase('id-ID');
    const customerName = transaction.nama_pelanggan.toLocaleLowerCase('id-ID');
    return transactionCode.includes(normalizedSearch) || customerName.includes(normalizedSearch);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Transaksi</h2>
        <p className="mt-1 text-sm text-gray-500">Lihat rincian, ubah pesanan, atau hapus transaksi.</p>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Cari kode transaksi atau nama pelanggan..."
          aria-label="Cari berdasarkan kode transaksi atau nama pelanggan"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <TransactionTable
        transactions={filteredTransactions}
        loading={loading}
        emptyMessage={normalizedSearch ? 'Tidak ada transaksi yang cocok dengan pencarian.' : undefined}
        onView={(transaction) => void openTransaction(transaction.id_transaksi, 'detail')}
        onEdit={(transaction) => void openTransaction(transaction.id_transaksi, 'edit')}
        onDelete={setDeleteTarget}
      />

      {modalMode === 'detail' && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setModalMode(null)}
        />
      )}
      {modalMode === 'edit' && (
        <TransactionEditModal
          transaction={selectedTransaction}
          products={products}
          customerName={customerName}
          items={items}
          selectedProductId={selectedProductId}
          saving={saving}
          onCustomerNameChange={setCustomerName}
          onSelectedProductChange={setSelectedProductId}
          onAddProduct={addItem}
          onQuantityChange={updateItemQuantity}
          onRemoveProduct={(productId) =>
            setItems((current) => current.filter((item) => item.id_produk !== productId))
          }
          onSubmit={saveTransaction}
          onClose={() => setModalMode(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Hapus Transaksi"
        message={`Transaksi ${deleteTarget?.kode_transaksi ?? ''} akan dihapus permanen. Stok dikembalikan jika transaksi berstatus Selesai.`}
        onConfirm={deleteTransaction}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: null, message: '' })} />
    </div>
  );
}