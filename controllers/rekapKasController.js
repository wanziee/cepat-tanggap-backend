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
    
    const rekapKas = await RekapKas.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nama', 'nik', 'role', 'rt', 'rw']
      }],
      order: [['tanggal', 'DESC']]
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
const createRekapKas = async (req, res) => {
  try {
    const { tanggal, keterangan, jenis, jumlah, saldo, rt, rw } = req.body;
    const userId = req.user.id;
    
    // Validasi input
    if (!tanggal || !keterangan || !jenis || !jumlah || !saldo) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }
    
    // Validasi RT/RW
    if (req.user.role === 'rt' && rt !== req.user.rt) {
      return res.status(403).json({
        success: false,
        message: 'Anda hanya dapat menambahkan data untuk RT Anda sendiri'
      });
    }
    
    if (req.user.role === 'rw' && rw !== req.user.rw) {
      return res.status(403).json({
        success: false,
        message: 'Anda hanya dapat menambahkan data untuk RW Anda sendiri'
      });
    }
    
    // Buat rekap kas baru
    const rekapKas = await RekapKas.create({
      tanggal,
      keterangan,
      jenis,
      jumlah,
      saldo,
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
