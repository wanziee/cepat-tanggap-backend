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

// Rute untuk mendapatkan semua user dengan filter opsional
router.get('/', (req, res, next) => {
  console.log('GET /api/users dipanggil dengan query:', req.query);
  next();
}, userController.getAllUsers);

// Rute untuk membuat user baru
router.post('/', (req, res, next) => {
  console.log('POST /api/users dipanggil dengan data:', req.body);
  next();
}, userController.createUser);


// Rute untuk mendapatkan detail user berdasarkan ID
router.get('/:id', (req, res, next) => {
  console.log(`GET /api/users/${req.params.id} dipanggil`);
  next();
}, userController.getUserById);

// Rute untuk memperbarui data user
router.put('/:id', (req, res, next) => {
  console.log(`PUT /api/users/${req.params.id} dipanggil dengan data:`, req.body);
  next();
}, userController.updateUser);

// Rute untuk menghapus user
router.delete('/:id', (req, res, next) => {
  console.log(`DELETE /api/users/${req.params.id} dipanggil`);
  next();
}, userController.deleteUser);

console.log('Router users berhasil diinisialisasi');
module.exports = router;
