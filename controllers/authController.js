const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { nik, nama, email, password, alamat, role = 'warga' } = req.body;

    if (!nik || !nama || !password) {
      return res.status(400).json({ message: 'NIK, nama, dan password harus diisi' });
    }

    // Validasi format email jika diberikan
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }

    // Cek NIK terdaftar
    const existingUser = await User.findOne({ where: { nik } });
    if (existingUser) {
      return res.status(400).json({ message: 'NIK sudah terdaftar' });
    }

    // Cek email terdaftar (jika email diberikan)
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }
    }

    // Buat user baru
    const user = await User.create({
      nik,
      nama,
      email,
      password,
      alamat,
      role
    });

    // Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const login = async (req, res) => {
  try {
    const { nik, password } = req.body;

    if (!nik || !password) {
      return res.status(400).json({ message: 'NIK dan password harus diisi' });
    }

    const user = await User.scope(null).findOne({ where: { nik } });
    if (!user) {
      return res.status(401).json({ message: 'NIK atau password salah' });
    }

    const isPasswordValid = user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'NIK atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Login berhasil',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};



const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
  return res.status(400).json({ 
    success: false,
    message: 'Email dan password harus diisi' 
  });
}


    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    // Cari user berdasarkan email
    const user = await User.scope(null).findOne({ 
      where: { 
        email,
        role: ['admin', 'rt', 'rw' ]// Pastikan hanya admin yang bisa login
      } 
    });

    // Validasi user
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Validasi password
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '8h', // Token berlaku 8 jam untuk admin
        issuer: 'cepat-tanggap-admin'
      }
    );

    // Siapkan data user untuk response
const userData = {
  id: user.id,
  nama: user.nama,
  email: user.email,
  nik: user.nik,        // ← tambahkan jika frontend pakai
  role: user.role,
  rt: user.rt,          // ← tambahkan
  rw: user.rw,          // ← tambahkan
  alamat: user.alamat,
  no_hp: user.no_hp,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
};


    // Set HTTP-only cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Hanya HTTPS di production
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 jam
      path: '/',
      // domain: 'localhost'
        // domain: process.env.NODE_ENV === 'production' ? '.railway.app' : 'localhost'
    });

    // Response
    res.status(200).json({
      success: true,
      message: 'Login admin berhasil',
      data: {
        user: userData,
        token: token // Tetap kirim token di response untuk mobile/SPA
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    const { nama, alamat, no_hp, email, rt, rw } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (no_hp !== undefined) updateData.no_hp = no_hp;
    if (rt !== undefined) updateData.rt = rt;
    if (rw !== undefined) updateData.rw = rw;

    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
      }

      const emailUsed = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });

      if (emailUsed) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh pengguna lain' });
      }

      updateData.email = email; // ✅ Tambahkan ini
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await user.update(updateData);

    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    const user = await User.findByPk(req.user.id, {
      include: ['laporan'],
      attributes: {
        exclude: ['password'],
        include: ['email', 'no_hp']
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const userData = user.get({ plain: true });

    const response = {
      id: userData.id,
      nik: userData.nik,
      nama: userData.nama,
      role: userData.role,
      alamat: userData.alamat || null,
      email: userData.email || null,
      no_hp: userData.no_hp || null,
      rt: userData.rt || null,
      rw: userData.rw || null,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      laporan: userData.laporan || []
    };

    res.json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Tidak terautentikasi' 
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        nik: user.nik,
        role: user.role,
        alamat: user.alamat,
        no_hp: user.no_hp,
        rt: user.rt,
        rw: user.rw,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isPasswordValid = await user.validPassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password lama salah' });
    }

    await user.update({ password: newPassword });

    res.json({ message: 'Password berhasil diperbarui' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  getMe,
  updateProfile,
  changePassword
};
