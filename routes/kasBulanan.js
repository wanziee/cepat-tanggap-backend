// routes/kasBulanan.js

const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const uploadPdf = require('../utils/uploadPdf'); // Pastikan ini mengarah ke konfigurasi multer

const kasBulananController = require('../controllers/kasBulananController');

console.log('Menginisialisasi router kas bulanan...');

// Middleware log
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// Autentikasi
router.use(auth);

// Role check untuk operasi baca (GET) - izinkan warga
router.get('/', (req, res, next) => {
  console.log('Memeriksa role user untuk akses baca:', req.user);
  const allowedRoles = ['admin', 'rt', 'rw', 'warga'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    console.log(`Akses baca diberikan untuk ${req.user.role}`);
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat data ini.'
  });
});

// Role check untuk operasi tulis (POST, PUT, DELETE)
router.use((req, res, next) => {
  // Skip untuk GET karena sudah dihandle di atas
  if (req.method === 'GET') return next();
  
  console.log('Memeriksa role user untuk akses tulis:', req.user);
  const allowedRoles = ['admin', 'rt', 'rw'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    console.log(`Akses tulis diberikan untuk ${req.user.role}`);
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Akses ditolak. Hanya admin, RT, atau RW yang diizinkan untuk mengubah data.'
  });
});

// GET all files (dengan filter opsional: RT/RW/public)
router.get('/', kasBulananController.getAllKasBulanan);

// POST: Tambah file kas bulanan
router.post(
  '/upload',
  uploadPdf.single('file'), // `file` adalah nama field di form
  kasBulananController.createKasBulanan // <--- PERUBAHAN DI SINI!
);

// PUT: Update deskripsi, is_public, dst.
router.put('/:id', kasBulananController.updateKasBulanan);

// DELETE: Hapus file
router.delete('/:id', kasBulananController.deleteKasBulanan);

console.log('Router kas bulanan berhasil diinisialisasi');
module.exports = router;