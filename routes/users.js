const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const userController = require('../controllers/userController.js');

console.log('Menginisialisasi router users...');

// Middleware untuk logging
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Middleware autentikasi
router.use(auth);

// Middleware untuk memeriksa role admin
router.use((req, res, next) => {
  console.log('Memeriksa role user:', req.user);
  
  if (req.user && req.user.role === 'admin') {
    console.log('Akses diberikan untuk admin');
    next();
  } else {
    console.log('Akses ditolak. Hanya admin yang diizinkan.');
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak. Hanya admin yang diizinkan.' 
    });
  }
});

// Rute untuk mendapatkan semua user
router.get('/', (req, res, next) => {
  console.log('GET /api/users dipanggil');
  next();
}, userController.getAllUsers);

// Rute untuk menghapus user
router.delete('/:id', (req, res, next) => {
  console.log(`DELETE /api/users/${req.params.id} dipanggil`);
  next();
}, userController.deleteUser);

console.log('Router users berhasil diinisialisasi');
module.exports = router;
