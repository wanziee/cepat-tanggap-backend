const { RekapKas, User } = require('../models');

// Get all rekap kas dengan filter RT/RW
const getAllRekapKas = async (req, res) => {
  try {
    const { rt, rw, startDate, endDate } = req.query;
    
    // Siapkan kondisi where
    const whereClause = {};
    
    // Filter berdasarkan RT jika ada
    if (rt) {
      whereClause.rt = rt;
    } else if (req.user.role === 'rt' && req.user.rt) {
      // Jika user adalah RT, filter berdasarkan RT-nya
      whereClause.rt = req.user.rt;
    }
    
    // Filter berdasarkan RW jika ada
    if (rw) {
      whereClause.rw = rw;
    } else if (req.user.role === 'rw' && req.user.rw) {
      // Jika user adalah RW, filter berdasarkan RW-nya
      whereClause.rw = req.user.rw;
    }
    
    // Filter berdasarkan tanggal jika ada
    if (startDate || endDate) {
      whereClause.tanggal = {};
      if (startDate) whereClause.tanggal[Op.gte] = new Date(startDate);
      if (endDate) whereClause.tanggal[Op.lte] = new Date(endDate);
    }
    
    const rawKas = await RekapKas.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nama', 'nik', 'role', 'rt', 'rw']
      }],
      order: [['tanggal', 'DESC']]
    });
    
    const rekapKas = rawKas.map(item => {
  const plain = item.get({ plain: true });
  return {
    ...plain,
    jumlah: Number(plain.jumlah),
    saldo: Number(plain.saldo),
  };
});
    
    res.status(200).json({
      success: true,
      data: rekapKas
    });

    
  } catch (error) {
    console.error('Get all rekap kas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new rekap kas
// ... (bagian atas kode yang sama) ...

// Create new rekap kas
const createRekapKas = async (req, res) => {
  try {
    // Hapus 'saldo' dari destructuring req.body karena kita tidak akan mengirimnya dari frontend
    const { tanggal, keterangan, jenis, jumlah, rt, rw } = req.body; 
    const userId = req.user.id;
    
    // Validasi input: Pastikan saldo TIDAK divalidasi di sini
    if (!tanggal || !keterangan || !jenis || !jumlah) { // Saldo DIHAPUS dari validasi ini
      return res.status(400).json({
        success: false,
        message: 'Semua field (kecuali saldo) harus diisi' // Pesan error bisa disesuaikan
      });
    }

    // --- LOGIKA PENTING: Hitung saldo terkini di backend ---
    // Cari saldo terakhir sebelum menambahkan transaksi baru
    const lastKasItem = await RekapKas.findOne({
      where: {
        rt: rt || req.user.rt, // Pastikan filter RT/RW sesuai dengan transaksi yang akan dibuat
        rw: rw || req.user.rw,
      },
      order: [['tanggal', 'DESC'], ['createdAt', 'DESC']], // Urutkan untuk mendapatkan yang terbaru
    });

    let currentCalculatedSaldo = lastKasItem ? Number(lastKasItem.saldo) : 0; // Saldo awal jika tidak ada transaksi sebelumnya

    const parsedJumlah = Number(jumlah); // Pastikan jumlah adalah angka
    if (jenis === "pemasukan") {
      currentCalculatedSaldo += parsedJumlah;
    } else if (jenis === "pengeluaran") {
      currentCalculatedSaldo -= parsedJumlah;
    }
    // --- Akhir logika hitung saldo ---
    
    // Validasi RT/RW (tetap ada)
    if (req.user.role === 'rt' && rt && rt !== req.user.rt) { // Tambahkan cek 'rt' untuk menghindari undefined
      return res.status(403).json({
        success: false,
        message: 'Anda hanya dapat menambahkan data untuk RT Anda sendiri'
      });
    }
    
    if (req.user.role === 'rw' && rw && rw !== req.user.rw) { // Tambahkan cek 'rw' untuk menghindari undefined
      return res.status(403).json({
        success: false,
        message: 'Anda hanya dapat menambahkan data untuk RW Anda sendiri'
      });
    }
    
    // Buat rekap kas baru dengan saldo yang sudah dihitung
    const rekapKas = await RekapKas.create({
      tanggal,
      keterangan,
      jenis,
      jumlah: parsedJumlah, // Pastikan ini angka
      saldo: currentCalculatedSaldo, // Gunakan saldo yang dihitung di backend
      rt: rt || req.user.rt,
      rw: rw || req.user.rw,
      user_id: userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Data rekap kas berhasil ditambahkan',
      data: rekapKas
    });
  } catch (error) {
    console.error('Create rekap kas error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data rekap kas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ... (bagian bawah kode yang sama) ...
// Update rekap kas
const updateRekapKas = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, keterangan, jenis, jumlah, saldo, rt, rw } = req.body;
    
    // Cari rekap kas
    const rekapKas = await RekapKas.findByPk(id);
    
    if (!rekapKas) {
      return res.status(404).json({
        success: false,
        message: 'Data rekap kas tidak ditemukan'
      });
    }
    
    // Cek akses (RT hanya bisa mengupdate data di RT-nya, RW di RW-nya)
    if (req.user.role === 'rt' && rekapKas.rt !== req.user.rt) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk mengupdate data ini'
      });
    }
    
    if (req.user.role === 'rw' && rekapKas.rw !== req.user.rw) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk mengupdate data ini'
      });
    }
    
    // Update data
    rekapKas.tanggal = tanggal || rekapKas.tanggal;
    rekapKas.keterangan = keterangan || rekapKas.keterangan;
    rekapKas.jenis = jenis || rekapKas.jenis;
    rekapKas.jumlah = jumlah || rekapKas.jumlah;
    rekapKas.saldo = saldo || rekapKas.saldo;
    
    // Hanya admin yang bisa update RT/RW
    if (req.user.role === 'admin') {
      rekapKas.rt = rt !== undefined ? rt : rekapKas.rt;
      rekapKas.rw = rw !== undefined ? rw : rekapKas.rw;
    }
    
    await rekapKas.save();
    
    res.status(200).json({
      success: true,
      message: 'Data rekap kas berhasil diperbarui',
      data: rekapKas
    });
  } catch (error) {
    console.error('Update rekap kas error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data rekap kas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete rekap kas
const deleteRekapKas = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cari rekap kas
    const rekapKas = await RekapKas.findByPk(id);
    
    if (!rekapKas) {
      return res.status(404).json({
        success: false,
        message: 'Data rekap kas tidak ditemukan'
      });
    }
    
    // Cek akses (RT hanya bisa menghapus data di RT-nya, RW di RW-nya)
    if (req.user.role === 'rt' && rekapKas.rt !== req.user.rt) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk menghapus data ini'
      });
    }
    
    if (req.user.role === 'rw' && rekapKas.rw !== req.user.rw) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk menghapus data ini'
      });
    }
    
    // Hapus rekap kas
    await rekapKas.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Data rekap kas berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete rekap kas error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data rekap kas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllRekapKas,
  createRekapKas,
  updateRekapKas,
  deleteRekapKas
};
