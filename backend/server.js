const cors = require('cors');
const express = require('express');
const pool = require('./config/database');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const { getErrorMessage } = require('./utils/errors');

const app = express();
const port = Number(process.env.API_PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', productRoutes);
app.use('/api', transactionRoutes);

app.use((error, _req, res, _next) => {
  const status = error?.type === 'entity.parse.failed' ? 400 : 500;
  res.status(status).json({ message: getErrorMessage(error, 'Terjadi kesalahan server.') });
});

const server = app.listen(port, () => {
  console.log(`Backend berjalan di http://localhost:${port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);