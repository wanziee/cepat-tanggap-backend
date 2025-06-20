const path = require('path');
const { Laporan, LogStatus, User } = require('../models');
const upload = require('../utils/upload');

const uploadFile = upload.single('foto');

const getAllLaporan = async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = {};
    
    // Filter by status jika ada
    if (status) {
      whereClause.status = status;
    }

    // Jika user bukan admin, hanya tampilkan laporan miliknya
    if (req.user.role === 'warga') {
      whereClause.user_id = req.user.id;
    }

    const laporan = await Laporan.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'role']
        },
        {
          model: LogStatus,
          as: 'logStatus',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'nama', 'role']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ message: 'Daftar laporan berhasil diambil', data: laporan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Get semua laporan tanpa filter user (untuk tab Laporan Warga)
const getAllLaporanPublic = async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    const laporan = await Laporan.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'role']
        },
        {
          model: LogStatus,
          as: 'logStatus',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'nama', 'role']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ message: 'Daftar laporan warga berhasil diambil', data: laporan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laporan = await Laporan.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'role']
        },
        {
          model: LogStatus,
          as: 'logStatus',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'nama', 'role']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!laporan) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    // Jika bukan admin dan bukan pemilik laporan
    if (req.user.role === 'warga' && laporan.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak mengakses laporan ini' });
    }

    res.json({ message: 'Detail laporan', data: laporan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const createLaporan = async (req, res) => {
  uploadFile(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { judul, deskripsi, lokasi } = req.body;
      
      // Validasi input
      if (!judul || !deskripsi) {
        return res.status(400).json({ message: 'Judul dan deskripsi harus diisi' });
      }

      // Path file jika ada upload
      let fotoPath = null;
      if (req.file) {
      fotoPath = `/uploads/${req.file.filename}`;
      }

      // Buat laporan
      const laporan = await Laporan.create({
        user_id: req.user.id,
        judul,
        deskripsi,
        foto: fotoPath,
        lokasi: lokasi || null,
        status: 'pending'
      });

      // Buat log status pertama
      await LogStatus.create({
        laporan_id: laporan.id,
        user_id: req.user.id,
        status: 'pending',
        waktu: new Date()
      });

      // Ambil data laporan lengkap
      const laporanBaru = await Laporan.findByPk(laporan.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nama', 'role']
          },
          {
            model: LogStatus,
            as: 'logStatus',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'nama', 'role']
              }
            ],
            order: [['created_at', 'DESC']]
          }
        ]
      });

      res.status(201).json({
        message: 'Laporan berhasil dibuat',
        data: laporanBaru
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  });
};

const updateLaporanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status
    if (!['pending', 'diproses', 'selesai'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    // Cari laporan
    const laporan = await Laporan.findByPk(id);
    if (!laporan) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    // Jika bukan admin/rt/rw dan bukan pemilik laporan
    if (req.user.role === 'warga' && laporan.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak mengubah status laporan ini' });
    }

    // Update status laporan
    await laporan.update({ status });

    // Buat log status baru
    await LogStatus.create({
      laporan_id: laporan.id,
      user_id: req.user.id,
      status,
      waktu: new Date()
    });

    // Ambil data laporan terbaru
    const updatedLaporan = await Laporan.findByPk(laporan.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'role']
        },
        {
          model: LogStatus,
          as: 'logStatus',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'nama', 'role']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    res.json({
      message: 'Status laporan berhasil diperbarui',
      data: updatedLaporan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const deleteLaporan = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari laporan
    const laporan = await Laporan.findByPk(id);
    if (!laporan) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    // Hanya admin dan pemilik laporan yang bisa menghapus
    if (req.user.role !== 'admin' && laporan.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus laporan ini' });
    }

    // Hapus file foto jika ada
    if (laporan.foto) {
      const filePath = path.join(__dirname, '..', laporan.foto);
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Hapus laporan
    await laporan.destroy();

    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  getAllLaporan,
  getAllLaporanPublic,
  getLaporanById,
  createLaporan,
  updateLaporanStatus,
  deleteLaporan
};
