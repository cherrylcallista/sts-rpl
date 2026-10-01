const express = require('express');
const pool = require('../config/database');
const { getErrorMessage, hasErrorCode } = require('../utils/errors');
const { parseProductInput } = require('../utils/validation');

const router = express.Router();

router.get('/kategori', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal memuat kategori.') });
  }
});

router.get('/produk', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const kategori = typeof req.query.kategori === 'string' ? req.query.kategori : '';
    let query = `
      SELECT p.*, k.nama_kategori
      FROM produk p
      JOIN kategori k ON p.id_kategori = k.id_kategori
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.nama_produk LIKE ? OR p.kode_produk LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (kategori) {
      query += ' AND p.id_kategori = ?';
      params.push(kategori);
    }

    query += ' ORDER BY p.id_produk DESC';
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal memuat produk.') });
  }
});

router.post('/produk', async (req, res) => {
  try {
    const input = parseProductInput(req.body);
    if (!input) {
      return res.status(400).json({ message: 'Semua field bertanda bintang wajib diisi.' });
    }

    await pool.query(
      `INSERT INTO produk (id_kategori, kode_produk, nama_produk, harga, stok, deskripsi)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [input.id_kategori, input.kode_produk, input.nama_produk, input.harga, input.stok, input.deskripsi]
    );
    return res.status(201).json({ message: 'Produk berhasil ditambahkan.' });
  } catch (error) {
    if (hasErrorCode(error, 'ER_DUP_ENTRY')) {
      return res.status(400).json({ message: 'Kode produk sudah terdaftar.' });
    }
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal menambahkan produk.') });
  }
});

router.get('/produk/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, k.nama_kategori
       FROM produk p
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE p.id_produk = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal memuat produk.') });
  }
});

router.put('/produk/:id', async (req, res) => {
  try {
    const input = parseProductInput(req.body);
    if (!input) return res.status(400).json({ message: 'Field wajib tidak boleh kosong.' });

    await pool.query(
      `UPDATE produk
       SET id_kategori = ?, kode_produk = ?, nama_produk = ?, harga = ?, stok = ?, deskripsi = ?
       WHERE id_produk = ?`,
      [input.id_kategori, input.kode_produk, input.nama_produk, input.harga, input.stok, input.deskripsi, req.params.id]
    );
    return res.json({ message: 'Produk berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal memperbarui produk.') });
  }
});

router.delete('/produk/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM produk WHERE id_produk = ?', [req.params.id]);
    return res.json({ message: 'Produk berhasil dihapus.' });
  } catch (error) {
    if (hasErrorCode(error, 'ER_ROW_IS_REFERENCED_2')) {
      return res.status(400).json({
        message: 'Produk tidak dapat dihapus karena tercatat dalam histori transaksi.',
      });
    }
    return res.status(500).json({ message: getErrorMessage(error, 'Gagal menghapus produk.') });
  }
});

module.exports = router;