// controllers/kasBulananController.js

const { KasBulanan, User } = require('../models'); // Pastikan ini adalah model File yang sudah di-rename menjadi KasBulanan
const fs = require('fs');
const path = require('path');

exports.getAllKasBulanan = async (req, res) => {
  try {
    const { rt, rw, is_public } = req.query; // is_public masih ada di sini, sesuaikan jika sudah dihapus dari DB
    const where = {};

    // Logika akses untuk is_public jika masih ada di DB Anda
    // Jika kolom is_public sudah dihapus dari DB, logika ini juga perlu dihapus
    if (is_public !== undefined) {
      where.is_public = is_public === 'true';
    }

    const currentUser = req.user; // Pastikan ini tersedia dari middleware auth
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Autentikasi diperlukan.' });
    }

    // Logic filter berdasarkan role, seperti yang kita diskusikan sebelumnya
    // Admin: Tidak perlu filter RT/RW
    // RW: Filter berdasarkan RW pengguna
    // RT/Warga: Filter berdasarkan RT dan RW pengguna
    if (currentUser.role === 'rw' && currentUser.rw) {
      where.related_rw = currentUser.rw;
    } else if (currentUser.role === 'rt' || currentUser.role === 'warga') {
      if (currentUser.rt && currentUser.rw) {
        where.related_rt = currentUser.rt;
        where.related_rw = currentUser.rw;
      } else {
        // Handle case where RT/Warga user doesn't have RT/RW data
        return res.status(403).json({ success: false, message: 'Akses ditolak: Data RT/RW Anda tidak ditemukan.' });
      }
    }
    // Jika query parameter rt/rw diberikan (misalnya oleh admin yang memfilter)
    // Ini akan menimpa filter role jika query parameter lebih spesifik
    if (rt) where.related_rt = rt;
    if (rw) where.related_rw = rw;


    const files = await KasBulanan.findAll({
      where,
      include: [{ model: User, as: 'uploader', attributes: ['id', 'nama', 'email'] }],
      order: [['upload_date', 'DESC']] // Urutkan agar yang terbaru di atas
    });
    res.json({ success: true, data: files });
  } catch (error) {
    console.error('Gagal mengambil kas bulanan:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Pastikan Anda sudah mengkonfigurasi `uploadPdf` dengan multer dan destination path-nya.
exports.createKasBulanan = async (req, res) => {
  try {
    // req.file akan berisi informasi file yang diupload oleh Multer
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload.' });
    }

    const { originalname, filename, mimetype, size, path: tempFilePath } = req.file; // path adalah path sementara multer

    // Data tambahan dari body form (jika ada, misal description, related_rt/rw override)
    // Pastikan `description` dan `is_public` dikirim sebagai bagian dari form-data
    const { description, related_rt, related_rw, is_public } = req.body;

    // Pastikan Anda menangani kasus is_public jika kolom ini sudah tidak ada di DB
    // Jika is_public sudah dihapus, cukup hapus baris `is_public: !!is_public` di bawah
    // dan pastikan Anda tidak lagi mengirimnya dari frontend.

    const kas = await KasBulanan.create({
      filename: originalname, // Nama asli file
filepath: `kas/${filename}`, // Path relatif dari folder 'uploads' atau public
      mimetype: mimetype,
      filesize: size,
      description: description || null, // Izinkan deskripsi kosong
      uploaded_by_user_id: req.user.id, // Pastikan req.user.id tersedia dari middleware auth
      related_rt: related_rt || req.user.rt, // Ambil dari body jika ada, fallback ke user.rt
      related_rw: related_rw || req.user.rw, // Ambil dari body jika ada, fallback ke user.rw
      upload_date: new Date(),
      // Jika kolom is_public sudah dihapus dari DB, hapus baris di bawah ini:
      is_public: !!is_public // Konversi ke boolean
    });

    res.status(201).json({ success: true, message: 'Kas bulanan ditambahkan', data: kas });
  } catch (error) {
    console.error('Gagal membuat kas bulanan:', error);
    // Jika ada error setelah upload (misal DB error), pertimbangkan untuk menghapus file yang baru diupload
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Hapus file yang sudah diupload multer jika DB error
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

exports.updateKasBulanan = async (req, res) => {
  try {
    const kas = await KasBulanan.findByPk(req.params.id);
    if (!kas) return res.status(404).json({ message: 'Data tidak ditemukan' });

    const currentUser = req.user;
    let hasAccess = false;

    // Ototrisasi update
    if (currentUser.role === 'admin') {
      hasAccess = true;
    } else if (currentUser.role === 'rt' && kas.related_rt === currentUser.rt && kas.related_rw === currentUser.rw) {
      hasAccess = true;
    } else if (currentUser.role === 'rw' && kas.related_rw === currentUser.rw) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk memperbarui data ini.' });
    }

    // Hanya admin yang bisa mengubah RT/RW file
    if (currentUser.role !== 'admin') {
      delete req.body.related_rt;
      delete req.body.related_rw;
      delete req.body.uploaded_by_user_id; // Tidak boleh diubah
    }
    // Jika is_public sudah dihapus dari DB, pastikan tidak ada di req.body saat update
    if (!kas.rawAttributes.is_public) { // Contoh cek apakah kolom ada di model
        delete req.body.is_public;
    }


    await kas.update(req.body);
    res.json({ success: true, message: 'Kas bulanan diperbarui', data: kas });
  } catch (error) {
    console.error('Gagal update:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteKasBulanan = async (req, res) => {
  try {
    const kas = await KasBulanan.findByPk(req.params.id);
    if (!kas) return res.status(404).json({ message: 'Data tidak ditemukan' });

    const currentUser = req.user;
    let hasAccess = false;

    // Otorisasi delete
    if (currentUser.role === 'admin') {
      hasAccess = true;
    } else if (currentUser.role === 'rt' && kas.related_rt === currentUser.rt && kas.related_rw === currentUser.rw) {
      hasAccess = true;
    } else if (currentUser.role === 'rw' && kas.related_rw === currentUser.rw) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk menghapus data ini.' });
    }


    const uploadDir = path.join(__dirname, '..', 'uploads'); // Sesuaikan ini dengan folder upload Multer Anda
    const fullPath = path.join(uploadDir, kas.filepath.startsWith('/') ? kas.filepath.substring(1) : kas.filepath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath); // Hapus file dari server
      console.log(`File fisik dihapus: ${fullPath}`);
    } else {
      console.warn(`File fisik tidak ditemukan, namun data DB akan dihapus: ${fullPath}`);
    }

    await kas.destroy();
    res.json({ success: true, message: 'File kas bulanan dihapus' });
  } catch (error) {
    console.error('Gagal hapus kas bulanan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};