function createRequestError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function parseProductInput(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const id_kategori = Number(value.id_kategori);
  const harga = Number(value.harga);
  const stok = Number(value.stok);

  if (
    !Number.isSafeInteger(id_kategori) ||
    id_kategori <= 0 ||
    typeof value.kode_produk !== 'string' ||
    !value.kode_produk.trim() ||
    typeof value.nama_produk !== 'string' ||
    !value.nama_produk.trim() ||
    !Number.isFinite(harga) ||
    harga < 0 ||
    !Number.isSafeInteger(stok) ||
    stok < 0 ||
    (value.deskripsi !== undefined && value.deskripsi !== null && typeof value.deskripsi !== 'string')
  ) {
    return null;
  }

  return {
    id_kategori,
    kode_produk: value.kode_produk.trim(),
    nama_produk: value.nama_produk.trim(),
    harga,
    stok,
    deskripsi: typeof value.deskripsi === 'string' && value.deskripsi.trim() ? value.deskripsi.trim() : null,
  };
}

function normalizeCheckoutPayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createRequestError('Format data transaksi tidak valid.');
  }
  if (typeof value.nama_pelanggan !== 'string' || !value.nama_pelanggan.trim()) {
    throw createRequestError('Nama pelanggan wajib diisi.');
  }
  if (!Array.isArray(value.items) || value.items.length === 0) {
    throw createRequestError('Pilih minimal 1 produk untuk order.');
  }

  const quantities = new Map();
  for (const item of value.items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw createRequestError('Format item transaksi tidak valid.');
    }
    if (!Number.isSafeInteger(item.id_produk) || item.id_produk <= 0) {
      throw createRequestError('Produk transaksi tidak valid.');
    }
    if (!Number.isSafeInteger(item.jumlah) || item.jumlah <= 0) {
      throw createRequestError('Jumlah pesanan produk harus bilangan bulat lebih dari 0.');
    }

    const totalJumlah = (quantities.get(item.id_produk) || 0) + item.jumlah;
    if (!Number.isSafeInteger(totalJumlah)) {
      throw createRequestError('Jumlah pesanan produk tidak valid.');
    }
    quantities.set(item.id_produk, totalJumlah);
  }

  return {
    nama_pelanggan: value.nama_pelanggan.trim(),
    items: [...quantities]
      .map(([id_produk, jumlah]) => ({ id_produk, jumlah }))
      .sort((a, b) => a.id_produk - b.id_produk),
  };
}

module.exports = { createRequestError, parseProductInput, normalizeCheckoutPayload };