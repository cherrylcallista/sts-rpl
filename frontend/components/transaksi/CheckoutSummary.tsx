'use client';
import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

interface CheckoutSummaryProps {
  customerName: string;
  itemCount: number;
  total: number;
  onCustomerNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
}

export default function CheckoutSummary({
  customerName,
  itemCount,
  total,
  onCustomerNameChange,
  onSubmit,
  disabled,
}: CheckoutSummaryProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="border-b pb-2 font-semibold text-gray-900">Informasi Pembeli</h3>

      <div>
        <label htmlFor="customer-name" className="mb-1 block text-xs font-semibold text-gray-700">
          Nama Pelanggan *
        </label>
        <input
          id="customer-name"
          type="text"
          required
          value={customerName}
          onChange={(event) => onCustomerNameChange(event.target.value)}
          placeholder="Contoh: Meja 04 / Bpk. Rudi"
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="space-y-2 rounded-lg border border-amber-200/60 bg-amber-50 p-4">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Total Item</span>
          <span className="font-semibold">{itemCount} item</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-amber-200/40 pt-2">
          <span className="text-sm font-semibold text-amber-950">Total Tagihan:</span>
          <span className="text-xl font-black text-amber-700">Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:bg-gray-300"
      >
        Proses Transaksi & Bayar <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
