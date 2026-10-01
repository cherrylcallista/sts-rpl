const express = require('express');
const pool = require('../config/database');
const { getErrorMessage } = require('../utils/errors');
const { normalizeCheckoutPayload } = require('../utils/validation');

const router = express.Router();

router.get('/ringkasan', async (_req, res) => {
  try {
    const [revenue, transactionCount, productCount, lowStock, latestTransactions] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total_bayar), 0) AS total FROM transaksi WHERE status = "Selesai"'),
      pool.query('SELECT COUNT(*) AS total FROM transaksi'),
      pool.query('SELECT COUNT(*) AS total FROM produk'),
      pool.query('SELECT COUNT(*) AS total FROM produk WHERE stok <= 5'),
      pool.query('SELECT * FROM transaksi ORDER BY id_transaksi DESC LIMIT 5'),
    ]).then((results) => results.map(([rows]) => rows));

    return res.json({
      totalPendapatan: Number(revenue[0].total),
      totalTransaksi: Number(transactionCount[0].total),
      totalProduk: Number(productCount[0].total),
      stokMenipis: Number(lowStock[0].total),
      transaksiTerbaru: latestTransactions,
    });
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal memuat ringkasan.') });
  }
});

router.get('/transaksi', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transaksi ORDER BY id_transaksi DESC');
    return res.json(rows.map((row) => ({ ...row, total_bayar: Number(row.total_bayar) })));
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal memuat daftar transaksi.') });
  }
});

router.get('/transaksi/:id', async (req, res) => {
  try {
    const transactionId = Number(req.params.id);
    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
      return res.status(400).json({ message: 'ID transaksi tidak valid.' });
    }

    const [transactions] = await pool.query('SELECT * FROM transaksi WHERE id_transaksi = ?', [transactionId]);
    if (transactions.length === 0) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });

    const [items] = await pool.query(
      `SELECT dt.id_produk, p.nama_produk, dt.jumlah, dt.subtotal
       FROM detail_transaksi dt
       JOIN produk p ON p.id_produk = dt.id_produk
       WHERE dt.id_transaksi = ?
       ORDER BY dt.id_produk ASC`,
      [transactionId]
    );
    return res.json({
      ...transactions[0],
      total_bayar: Number(transactions[0].total_bayar),
      items: items.map((item) => ({
        ...item,
        harga: Number(item.subtotal) / Number(item.jumlah),
        jumlah: Number(item.jumlah),
        subtotal: Number(item.subtotal),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal memuat detail transaksi.') });
  }
});

router.put('/transaksi/:id', async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const transactionId = Number(req.params.id);
    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
      return res.status(400).json({ message: 'ID transaksi tidak valid.' });
    }
    const { nama_pelanggan, items } = normalizeCheckoutPayload(req.body);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [transactions] = await connection.query(
      'SELECT id_transaksi, status FROM transaksi WHERE id_transaksi = ? FOR UPDATE',
      [transactionId]
    );
    if (transactions.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    }

    const [oldItems] = await connection.query(
      'SELECT id_produk, jumlah, subtotal FROM detail_transaksi WHERE id_transaksi = ? ORDER BY id_produk FOR UPDATE',
      [transactionId]
    );
    const oldQuantities = new Map(oldItems.map((item) => [Number(item.id_produk), Number(item.jumlah)]));
    const oldPrices = new Map(oldItems.map((item) => [Number(item.id_produk), Number(item.subtotal) / Number(item.jumlah)]));
    const newQuantities = new Map(items.map((item) => [item.id_produk, item.jumlah]));
    const productIds = [...new Set([...oldQuantities.keys(), ...newQuantities.keys()])].sort((a, b) => a - b);
    const [products] = await connection.query(
      'SELECT id_produk, nama_produk, harga, stok FROM produk WHERE id_produk IN (?) ORDER BY id_produk FOR UPDATE',
      [productIds]
    );
    const productsById = new Map(products.map((product) => [Number(product.id_produk), product]));

    for (const item of items) {
      const product = productsById.get(item.id_produk);
      if (!product) throw Object.assign(new Error(`Produk ID ${item.id_produk} tidak ditemukan.`), { status: 400 });
      if (transactions[0].status === 'Selesai' && Number(product.stok) + (oldQuantities.get(item.id_produk) || 0) < item.jumlah) {
        throw Object.assign(new Error(`Stok "${product.nama_produk}" tidak mencukupi.`), { status: 400 });
      }
    }

    let totalBayar = 0;
    for (const item of items) {
      const product = productsById.get(item.id_produk);
      const subtotal = (oldPrices.get(item.id_produk) ?? Number(product.harga)) * item.jumlah;
      totalBayar += subtotal;
      if (transactions[0].status === 'Selesai') {
        const stockChange = (oldQuantities.get(item.id_produk) || 0) - item.jumlah;
        await connection.query('UPDATE produk SET stok = stok + ? WHERE id_produk = ?', [stockChange, item.id_produk]);
      }
    }
    if (transactions[0].status === 'Selesai') {
      for (const [productId, oldQuantity] of oldQuantities) {
        if (!newQuantities.has(productId)) {
          await connection.query('UPDATE produk SET stok = stok + ? WHERE id_produk = ?', [oldQuantity, productId]);
        }
      }
    }

    await connection.query('DELETE FROM detail_transaksi WHERE id_transaksi = ?', [transactionId]);
    for (const item of items) {
      const subtotal = (oldPrices.get(item.id_produk) ?? Number(productsById.get(item.id_produk).harga)) * item.jumlah;
      await connection.query(
        'INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah, subtotal) VALUES (?, ?, ?, ?)',
        [transactionId, item.id_produk, item.jumlah, subtotal]
      );
    }
    await connection.query(
      'UPDATE transaksi SET nama_pelanggan = ?, total_bayar = ? WHERE id_transaksi = ?',
      [nama_pelanggan, totalBayar, transactionId]
    );

    await connection.commit();
    transactionStarted = false;
    return res.json({ message: 'Transaksi berhasil diperbarui.' });
  } catch (error) {
    if (connection && transactionStarted) await connection.rollback().catch(() => undefined);
    const status = Number.isInteger(error?.status) ? error.status : 500;
    return res.status(status).json({ message: getErrorMessage(error, 'Gagal memperbarui transaksi.') });
  } finally {
    connection?.release();
  }
});

router.delete('/transaksi/:id', async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const transactionId = Number(req.params.id);
    if (!Number.isSafeInteger(transactionId) || transactionId <= 0) {
      return res.status(400).json({ message: 'ID transaksi tidak valid.' });
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [transactions] = await connection.query(
      'SELECT id_transaksi, status FROM transaksi WHERE id_transaksi = ? FOR UPDATE',
      [transactionId]
    );
    if (transactions.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    }

    const [items] = await connection.query(
      'SELECT id_produk, jumlah FROM detail_transaksi WHERE id_transaksi = ? ORDER BY id_produk FOR UPDATE',
      [transactionId]
    );
    if (transactions[0].status === 'Selesai' && items.length > 0) {
      const productIds = items.map((item) => Number(item.id_produk));
      await connection.query(
        'SELECT id_produk FROM produk WHERE id_produk IN (?) ORDER BY id_produk FOR UPDATE',
        [productIds]
      );
      for (const item of items) {
        await connection.query('UPDATE produk SET stok = stok + ? WHERE id_produk = ?', [item.jumlah, item.id_produk]);
      }
    }
    await connection.query('DELETE FROM detail_transaksi WHERE id_transaksi = ?', [transactionId]);
    await connection.query('DELETE FROM transaksi WHERE id_transaksi = ?', [transactionId]);
    await connection.commit();
    transactionStarted = false;
    return res.json({ message: 'Transaksi berhasil dihapus.' });
  } catch (error) {
    if (connection && transactionStarted) await connection.rollback().catch(() => undefined);
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal menghapus transaksi.') });
  } finally {
    connection?.release();
  }
});

router.post('/transaksi', async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const { nama_pelanggan, items } = normalizeCheckoutPayload(req.body);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    let totalBayar = 0;
    const products = new Map();
    for (const item of items) {
      const [rows] = await connection.query(
        'SELECT id_produk, nama_produk, harga, stok FROM produk WHERE id_produk = ? FOR UPDATE',
        [item.id_produk]
      );
      if (rows.length === 0) throw Object.assign(new Error(`Produk ID ${item.id_produk} tidak ditemukan.`), { status: 400 });

      const product = rows[0];
      if (product.stok < item.jumlah) {
        throw Object.assign(new Error(`Stok "${product.nama_produk}" tidak mencukupi (sisa ${product.stok}).`), {
          status: 400,
        });
      }
      products.set(item.id_produk, product);
      totalBayar += Number(product.harga) * item.jumlah;
    }

    const transactionCode = `TRX-${Date.now().toString().slice(-8)}`;
    const [transactionResult] = await connection.query(
      'INSERT INTO transaksi (kode_transaksi, nama_pelanggan, total_bayar, status) VALUES (?, ?, ?, ?)',
      [transactionCode, nama_pelanggan, totalBayar, 'Selesai']
    );

    for (const item of items) {
      const subtotal = Number(products.get(item.id_produk).harga) * item.jumlah;
      await connection.query(
        'INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah, subtotal) VALUES (?, ?, ?, ?)',
        [transactionResult.insertId, item.id_produk, item.jumlah, subtotal]
      );
      await connection.query('UPDATE produk SET stok = stok - ? WHERE id_produk = ?', [item.jumlah, item.id_produk]);
    }

    await connection.commit();
    transactionStarted = false;
    return res.json({
      message: 'Transaksi berhasil disimpan dan stok terpotong.',
      kode_transaksi: transactionCode,
    });
  } catch (error) {
    if (connection && transactionStarted) await connection.rollback().catch(() => undefined);
    const status = Number.isInteger(error?.status) ? error.status : 500;
    return res.status(status).json({ message: getErrorMessage(error, 'Gagal memproses transaksi.') });
  } finally {
    connection?.release();
  }
});

module.exports = router;