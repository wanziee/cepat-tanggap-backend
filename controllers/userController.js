const { User } = require('../models');

// Get all users
const getAllUsers = async (req, res) => {
  console.log('getAllUsers dipanggil');
  console.log('User yang meminta:', req.user);
  console.log('Mengambil semua pengguna dari database...');
  try {
    // Dapatkan parameter query untuk filter
    const { rt, rw } = req.query;
    
    // Siapkan kondisi where
    const whereClause = {};
    
    // Tambahkan filter RT jika ada
    if (rt) {
      whereClause.rt = rt;
    }
    
    // Tambahkan filter RW jika ada
    if (rw) {
      whereClause.rw = rw;
    }
    
    // Jika user adalah RT, filter berdasarkan RT-nya
    if (req.user.role === 'rt' && req.user.rt) {
      whereClause.rt = req.user.rt;
    }
    
    // Jika user adalah RW, filter berdasarkan RW-nya
    if (req.user.role === 'rw' && req.user.rw) {
      whereClause.rw = req.user.rw;
    }
    
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// Create new user (warga)
const createUser = async (req, res) => {
  try {
    const { nik, nama, email, no_hp, alamat, rt, rw, role } = req.body;

    // Validasi data sederhana
    if (!nik || !nama || !no_hp || !rt || !rw) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Pastikan semua kolom wajib diisi.',
      });
    }

    // Cek apakah NIK sudah digunakan
    const existingUser = await User.findOne({ where: { nik } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'NIK sudah terdaftar.',
      });
    }
const emailToSave = email?.trim() === "" ? null : email;
    const newUser = await User.create({
      nik,
      nama,
      email: emailToSave,
      no_hp,
      alamat,
      rt,
      rw,
      role: role || 'warga', 
  password: no_hp,
    });

    const responseUser = newUser.get({ plain: true });
    delete responseUser.password;

    res.status(201).json({
      success: true,
      message: 'Warga berhasil ditambahkan',
      data: responseUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }
    
    // Cek akses (RT hanya bisa mengakses data di RT-nya, RW di RW-nya)
    if (req.user.role === 'rt' && user.rt !== req.user.rt) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke data ini'
      });
    }
    
    if (req.user.role === 'rw' && user.rw !== req.user.rw) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke data ini'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, alamat, no_hp, role, rt, rw } = req.body;
    
    // Cari user
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }
    
    // Cek akses (RT hanya bisa mengupdate data di RT-nya, RW di RW-nya)
    if (req.user.role === 'rt' && user.rt !== req.user.rt) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk mengupdate data ini'
      });
    }
    
    if (req.user.role === 'rw' && user.rw !== req.user.rw) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk mengupdate data ini'
      });
    }
    
    // Update data
    user.nama = nama || user.nama;
    user.email = email || user.email;
    user.alamat = alamat || user.alamat;
    user.no_hp = no_hp || user.no_hp;
    
    // Hanya admin yang bisa update role, rt, rw
    if (req.user.role === 'admin') {
      user.role = role || user.role;
      user.rt = rt !== undefined ? rt : user.rt;
      user.rw = rw !== undefined ? rw : user.rw;
    }
    
    await user.save();
    
    // Hapus password dari response
    const userData = user.get({ plain: true });
    delete userData.password;
    
    res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diperbarui',
      data: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek jika user mencoba menghapus dirinya sendiri
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri'
      });
    }

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Pengguna berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
};