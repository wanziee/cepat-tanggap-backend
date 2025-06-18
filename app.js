const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const db = require('./models');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const laporanRoutes = require('./routes/laporan');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);

// Test database connection
const testConnection = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Koneksi database berhasil');
    // Optional: Sync database schema (hanya untuk development, hapus di produksi)
    // await db.sequelize.sync({ force: false });
  } catch (error) {
    console.error('Tidak dapat terhubung ke database:', error);
    process.exit(1); // Keluar dengan kode error jika koneksi gagal
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 handler triggered for:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Jalankan server dan tes koneksi database
const startServer = async () => {
  await testConnection(); // Tunggu koneksi database sebelum start server
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });

  // Tangani error server (misalnya, port sudah digunakan)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} sudah digunakan, coba port lain.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

// Jalankan server
startServer().catch((err) => {
  console.error('Gagal memulai server:', err);
  process.exit(1);
});

module.exports = app;