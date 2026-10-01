CREATE DATABASE IF NOT EXISTS sts_rpl;
USE sts_rpl;

CREATE TABLE kategori (
	id_kategori INT NOT NULL AUTO_INCREMENT,
	nama_kategori VARCHAR(50) NOT NULL,
	keterangan VARCHAR(100),
	PRIMARY KEY (id_kategori)
) ENGINE=InnoDB;

CREATE TABLE produk (
	id_produk INT NOT NULL AUTO_INCREMENT,
	id_kategori INT NOT NULL,
	kode_produk VARCHAR(20) NOT NULL,
	nama_produk VARCHAR(100) NOT NULL,
	harga INT NOT NULL,
	stok INT NOT NULL DEFAULT 0,
	deskripsi TEXT,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id_produk),
	KEY idx_produk_kategori (id_kategori),
	CONSTRAINT fk_produk_kategori
		FOREIGN KEY (id_kategori) REFERENCES kategori (id_kategori)
) ENGINE=InnoDB;

CREATE TABLE transaksi (
	id_transaksi INT NOT NULL AUTO_INCREMENT,
	kode_transaksi VARCHAR(30) NOT NULL,
	tanggal_transaksi DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	nama_pelanggan VARCHAR(100) NOT NULL,
	total_bayar INT NOT NULL DEFAULT 0,
	status ENUM('Selesai', 'Pending', 'Batal') NOT NULL DEFAULT 'Selesai',
	PRIMARY KEY (id_transaksi)
) ENGINE=InnoDB;

CREATE TABLE detail_transaksi (
	id_detail INT NOT NULL AUTO_INCREMENT,
	id_transaksi INT NOT NULL,
	id_produk INT NOT NULL,
	jumlah INT NOT NULL,
	subtotal INT NOT NULL,
	PRIMARY KEY (id_detail),
	KEY idx_detail_transaksi (id_transaksi),
	KEY idx_detail_produk (id_produk),
	CONSTRAINT fk_detail_transaksi_transaksi
		FOREIGN KEY (id_transaksi) REFERENCES transaksi (id_transaksi),
	CONSTRAINT fk_detail_transaksi_produk
		FOREIGN KEY (id_produk) REFERENCES produk (id_produk)
) ENGINE=InnoDB;