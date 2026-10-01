export interface Kategori {
  id_kategori: number;
  nama_kategori: string;
  keterangan: string | null;
}

export interface Produk {
  id_produk: number;
  id_kategori: number;
  nama_kategori?: string;
  kode_produk: string;
  nama_produk: string;
  harga: number;
  stok: number;
  deskripsi: string | null;
  created_at?: string;
}

export interface Transaksi {
  id_transaksi: number;
  kode_transaksi: string;
  tanggal_transaksi: string;
  nama_pelanggan: string;
  total_bayar: number;
  status: 'Selesai' | 'Pending' | 'Batal';
}

export interface ItemTransaksi {
  id_produk: number;
  nama_produk: string;
  harga: number;
  jumlah: number;
  subtotal: number;
}

export interface DetailTransaksi extends Transaksi {
  items: ItemTransaksi[];
}

export interface DetailTransaksiPayload {
  id_produk: number;
  jumlah: number;
}

export interface CheckoutPayload {
  nama_pelanggan: string;
  items: DetailTransaksiPayload[];
}

export interface RingkasanDashboard {
  totalPendapatan: number;
  totalTransaksi: number;
  totalProduk: number;
  stokMenipis: number;
  transaksiTerbaru: Transaksi[];
}