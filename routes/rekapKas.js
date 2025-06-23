const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const rekapKasController = require('../controllers/rekapKasController');

console.log('Menginisialisasi router rekap kas...');

// Middleware untuk logging
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// Middleware autentikasi
router.use(auth);

// Middleware untuk memeriksa role yang diizinkan
router.use((req, res, next) => {
  console.log('Memeriksa role user:', req.user);
  
  // Daftar role yang diizinkan untuk mengakses rute ini
  const allowedRoles = ['admin', 'rt', 'rw'];
  
  if (req.user && allowedRoles.includes(req.user.role)) {
    console.log(`Akses diberikan untuk ${req.user.role}`);
    next();
  } else {
    console.log('Akses ditolak. Hanya admin, RT, atau RW yang diizinkan.');
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak. Hanya admin, RT, atau RW yang diizinkan.' 
    });
  }
});

// Rute untuk mendapatkan semua rekap kas dengan filter opsional
router.get('/', (req, res, next) => {
  console.log('GET /api/rekap-kas dipanggil dengan query:', req.query);
  next();
}, rekapKasController.getAllRekapKas);

// Rute untuk menambahkan rekap kas baru
router.post('/', (req, res, next) => {
  console.log('POST /api/rekap-kas dipanggil dengan data:', req.body);
  next();
}, rekapKasController.createRekapKas);

// Rute untuk memperbarui rekap kas
router.put('/:id', (req, res, next) => {
  console.log(`PUT /api/rekap-kas/${req.params.id} dipanggil dengan data:`, req.body);
  next();
}, rekapKasController.updateRekapKas);

// Rute untuk menghapus rekap kas
router.delete('/:id', (req, res, next) => {
  console.log(`DELETE /api/rekap-kas/${req.params.id} dipanggil`);
  next();
}, rekapKasController.deleteRekapKas);

console.log('Router rekap kas berhasil diinisialisasi');
module.exports = router;
