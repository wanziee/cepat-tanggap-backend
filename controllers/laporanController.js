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
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] } // Exclude password field
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
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] } // Exclude password field
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
          attributes: ['id', 'nama', 'role', 'alamat', 'email', 'no_hp']
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

      const { kategori, deskripsi, lokasi } = req.body;
      
      // Validasi input
      if (!kategori || !deskripsi) {
        return res.status(400).json({ message: 'Kategori dan deskripsi harus diisi' });
      }

      // Path file jika ada upload
      let fotoPath = null;
      if (req.file) {
      fotoPath = `/uploads/${req.file.filename}`;
      }

      const moment = require('moment');
const { Op } = require('sequelize');

// generate kode laporan
const today = moment().format('YYYYMMDD');
const countToday = await Laporan.count({
  where: {
    created_at: {
      [Op.gte]: moment().startOf('day').toDate(),
      [Op.lt]: moment().endOf('day').toDate()
    }
  }
});
const sequence = String(countToday + 1).padStart(4, '0');
const kd_laporan = `LAP${today}${sequence}`;



      // Buat laporan
      const laporan = await Laporan.create({
        user_id: req.user.id,
        kd_laporan,
        kategori,
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
const updateLaporanStatus = (req, res) => {
  uploadFile(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { id } = req.params;
      const { status, tanggapan } = req.body;

      if (!['pending', 'diproses', 'selesai', 'ditolak'].includes(status)) {
        return res.status(400).json({ message: 'Status tidak valid' });
      }

      const laporan = await Laporan.findByPk(id);
      if (!laporan) {
        return res.status(404).json({ message: 'Laporan tidak ditemukan' });
      }

      if (req.user.role === 'warga' && laporan.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Tidak berhak mengubah status ini' });
      }

      // 1. Update status laporan
      await laporan.update({ status });

      // 2. Buat log status baru
      await LogStatus.create({
        laporan_id: laporan.id,
        user_id: req.user.id,
        status,
        tanggapan: tanggapan || null,
        waktu: new Date(),
        foto: req.file ? `/uploads/${req.file.filename}` : null // tambahkan path foto jika ada
      });

      // 3. Ambil data laporan terbaru
      const updated = await Laporan.findByPk(laporan.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'nama', 'role'] },
          {
            model: LogStatus,
            as: 'logStatus',
            include: [{ model: User, as: 'user', attributes: ['id', 'nama', 'role'] }],
            order: [['created_at', 'DESC']]
          }
        ]
      });

      res.json({ message: 'Status dan tanggapan diperbarui', data: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  });
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
