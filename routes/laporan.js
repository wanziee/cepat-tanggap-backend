const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { auth, authorize } = require('../middlewares/auth');

// Public route for all warga laporan
router.get('/all', laporanController.getAllLaporanPublic);

// Semua route di bawah ini membutuhkan autentikasi
router.use(auth);

// Route untuk warga
router.get('/', laporanController.getAllLaporan);
router.get('/:id', laporanController.getLaporanById);
router.post('/', laporanController.createLaporan);
router.put('/:id/status', laporanController.updateLaporanStatus);
router.delete('/:id', laporanController.deleteLaporan);

// Route khusus admin/rt/rw
router.get('/admin/semua', 
  authorize(['admin', 'rt', 'rw']), 
  laporanController.getAllLaporan
);

module.exports = router;
