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

const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    const { nama, alamat, no_hp, email } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (no_hp !== undefined) updateData.no_hp = no_hp;

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

      updateData.email = email;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await user.update(updateData);
    await user.reload();

    const userData = user.get({ plain: true });
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password'],
        include: ['email', 'no_hp']
      },
      include: [
        {
          association: 'laporan',
          attributes: ['id', 'kategori', 'deskripsi', 'status', 'created_at'],
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
