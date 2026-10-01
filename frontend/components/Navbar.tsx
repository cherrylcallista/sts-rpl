'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, ReceiptText } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/produk', label: 'Daftar Produk', icon: UtensilsCrossed },
    { href: '/transaksi', label: 'Transaksi', icon: ReceiptText },
    { href: '/transaksi/baru', label: 'Order Baru', icon: ShoppingBag },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 min-h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 sm:py-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-lg font-black text-xl leading-none">
            FO
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">FoodOrder STS</h1>
            <p className="text-xs text-gray-500">Sistem Kasir & Pemesanan</p>
          </div>
        </div>
        <nav className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}