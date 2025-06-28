const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const db = require('./models');
require('dotenv').config();

// Import routes and controllers
const authRoutes = require('./routes/auth');
const laporanRoutes = require('./routes/laporan');
const authController = require('./controllers/authController');

const app = express();

// === Middleware Logging ===
app.use(morgan('dev'));

// === CORS Configuration ===
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173'
];

// Apply CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// === Body Parser Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Static Files ===
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Root Route ===
app.get('/', (req, res) => {
  res.json({
    message: 'Selamat datang di API Cepat Tanggap',
    status: 'berjalan',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      laporan: '/api/laporan',
      users: '/api/users',
      rekapKas: '/api/rekap-kas'
    },
    documentation: 'https://docs.cepattanggap.api'
  });
});

// === API Routes ===
console.log('Mendaftarkan rute API...');

// 1. Rute API
app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);

// 2. Rute Users
const usersRouter = require('./routes/users');
const rekapKasRouter = require('./routes/rekapKas');

app.use('/api/users', usersRouter);
app.use('/api/rekap-kas', rekapKasRouter);

const kasBulananRoutes = require('./routes/kasBulanan');
app.use('/api/kas-bulanan', kasBulananRoutes);


// Debug admin login route (pindahkan ke authRoutes jika perlu)
app.post('/api/auth/admin/login', (req, res, next) => {
  console.log('Admin login route hit!');
  console.log('Body:', req.body);
  next();
}, authController.adminLogin);

// === Error Handler ===
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// === 404 Handler ===
app.use((req, res) => {
  console.log('404 handler triggered for:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// === Database Connection Test ===
const testConnection = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Koneksi database berhasil');
    // await db.sequelize.sync({ force: false }); // opsional
  } catch (error) {
    console.error('Tidak dapat terhubung ke database:', error);
    process.exit(1);
  }
};

// === Start Server ===
async function startServer() {
  try {
    // Test koneksi database
    await testConnection();
    
    // Mulai server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`\nServer berjalan di http://localhost:${PORT}`);
      
      // Tampilkan rute yang tersedia (versi sederhana)
      console.log('\n=== Daftar Rute yang Tersedia ===');
      
      // Rute langsung
      console.log('GET           /');
      console.log('GET           /api/');
      
      // Rute auth
      console.log('POST          /api/auth/register');
      console.log('POST          /api/auth/login');
      console.log('POST          /api/auth/admin/login');
      console.log('GET           /api/auth/me');
      console.log('GET, PUT      /api/auth/profile');
      
      // Rute laporan
      console.log('GET, POST     /api/laporan');
      
      // Rute users (admin)
      console.log('GET           /api/users');
      console.log('DELETE        /api/users/:id');
      
      console.log('================================\n');
      console.log('Gunakan token JWT yang valid untuk mengakses endpoint yang dilindungi');
      console.log('================================\n');
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} sudah digunakan, coba port lain.`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });
    
    return server;
  } catch (error) {
    console.error('Gagal memulai server:', error);
    process.exit(1);
  }
}

// Mulai server
startServer();

module.exports = app;
