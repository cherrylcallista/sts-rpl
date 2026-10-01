'use client';
import { useState, useEffect, type FormEvent } from 'react';
import type { Produk } from '@/types';
import Toast from '@/components/Toast';
import CheckoutSummary from '@/components/transaksi/CheckoutSummary';
import OrderCartTable, { type CartItem } from '@/components/transaksi/OrderCartTable';
import OrderProductPicker from '@/components/transaksi/OrderProductPicker';
import { useRouter } from 'next/navigation';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function OrderBaruPage() {
  const router = useRouter();
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProdukId, setSelectedProdukId] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/produk', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat daftar produk.');
        return res.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('Format data produk tidak valid.');
        setProdukList(data.filter((product: Produk) => product.stok > 0));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setToast({ type: 'error', message: getErrorMessage(error, 'Gagal memuat daftar produk.') });
        }
      });
    return () => controller.abort();
  }, []);

  const handleAddToCart = () => {
    if (!selectedProdukId) return;
    const target = produkList.find((p) => p.id_produk === Number(selectedProdukId));
    if (!target) return;

    if (cart.some((c) => c.id_produk === target.id_produk)) {
      setToast({ type: 'error', message: 'Item sudah berada dalam keranjang belanja.' });
      return;
    }

    setCart([
      ...cart,
      {
        id_produk: target.id_produk,
        nama_produk: target.nama_produk,
        harga: target.harga,
        stok_tersedia: target.stok,
        jumlah: 1,
        subtotal: target.harga,
      },
    ]);
    setSelectedProdukId('');
  };

  const updateJumlah = (id_produk: number, jumlah: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id_produk === id_produk) {
          const qty = Math.max(1, Math.min(item.stok_tersedia, Number.isFinite(jumlah) ? Math.trunc(jumlah) : 1));
          return { ...item, jumlah: qty, subtotal: qty * item.harga };
        }
        return item;
      })
    );
  };

  const removeItem = (id_produk: number) => {
    setCart((prev) => prev.filter((item) => item.id_produk !== id_produk));
  };

  const totalBayar = cart.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleSubmitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!namaPelanggan.trim()) {
      setToast({ type: 'error', message: 'Nama pemesan wajib diisi.' });
      return;
    }
    if (cart.length === 0) {
      setToast({ type: 'error', message: 'Pilih minimal satu pesanan menu.' });
      return;
    }

    try {
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_pelanggan: namaPelanggan,
          items: cart.map((c) => ({
            id_produk: c.id_produk,
            jumlah: c.jumlah,
          })),
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Transaksi gagal.');

      setToast({ type: 'success', message: `${resData.message} (${resData.kode_transaksi})` });
      setCart([]);
      setNamaPelanggan('');

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: unknown) {
      setToast({ type: 'error', message: getErrorMessage(error, 'Transaksi gagal.') });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Form Transaksi Kasir / Order</h2>
        <p className="text-gray-500 text-sm mt-1">
          Pencatatan transaksi multi-tabel terintegrasi dengan pemotongan stok otomatis secara aman.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <OrderProductPicker
            products={produkList}
            selectedProductId={selectedProdukId}
            onProductChange={setSelectedProdukId}
            onAddProduct={handleAddToCart}
          />
          <OrderCartTable items={cart} onQuantityChange={updateJumlah} onRemoveItem={removeItem} />
        </div>

        <div>
          <CheckoutSummary
            customerName={namaPelanggan}
            itemCount={cart.reduce((total, item) => total + item.jumlah, 0)}
            total={totalBayar}
            onCustomerNameChange={setNamaPelanggan}
            onSubmit={handleSubmitCheckout}
            disabled={cart.length === 0}
          />
        </div>
      </div>

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: null, message: '' })} />
    </div>
  );
}