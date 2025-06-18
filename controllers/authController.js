const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { nik, nama, password, alamat, role = 'warga' } = req.body;
    
    // Validasi input
    if (!nik || !nama || !password) {
      return res.status(400).json({ message: 'NIK, nama, dan password harus diisi' });
    }

    // Cek apakah NIK sudah terdaftar
    const existingUser = await User.findOne({ where: { nik } });
    if (existingUser) {
      return res.status(400).json({ message: 'NIK sudah terdaftar' });
    }

    // Buat user baru
    const user = await User.create({
      nik,
      nama,
      password,
      alamat,
      role
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Hilangkan password dari response
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

    // Validasi input
    if (!nik || !password) {
      return res.status(400).json({ message: 'NIK dan password harus diisi' });
    }

    // Cari user (unscoped to include password field)
    const user = await User.scope(null).findOne({ where: { nik } });
    if (!user) {
      return res.status(401).json({ message: 'NIK atau password salah' });
    }

    // Verifikasi password
    const isPasswordValid = user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'NIK atau password salah' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Hilangkan password dari response
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
    console.log('=== UPDATE PROFILE REQUEST ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user ? req.user.id : 'No user');
    
    if (!req.user) {
      console.error('No user in request');
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    const { nama, alamat, no_hp } = req.body;
    const userId = req.user.id;

    // Validate request
    if (!userId) {
      console.error('No user ID in request');
      return res.status(400).json({ message: 'ID user tidak valid' });
    }

    // Prepare update data
    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (no_hp !== undefined) updateData.no_hp = no_hp;
    
    console.log('Update data for user', userId, ':', updateData);

    // Find user first
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Update user
    await user.update(updateData);
    
    // Reload to get updated data
    await user.reload();

    // Prepare response
    const userData = user.get({ plain: true });
    delete userData.password; // Remove password from response

    console.log('Successfully updated user:', userData);

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
        include: ['no_hp'] // Pastikan no_hp disertakan
      },
      include: [
        { 
          association: 'laporan',
          attributes: ['id', 'judul', 'status', 'created_at'],
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Dapatkan data user mentah dari database
    const userData = user.get({ plain: true });
    
    // Log data mentah dari database
    console.log('=== RAW USER DATA FROM DB ===');
    console.log('ID:', userData.id);
    console.log('NIK:', userData.nik);
    console.log('Nama:', userData.nama);
    console.log('Role:', userData.role);
    console.log('Alamat:', userData.alamat);
    console.log('No HP:', userData.no_hp);
    console.log('All fields:', Object.keys(userData));
    console.log('=============================');

    // Format respons
    const response = {
      id: userData.id,
      nik: userData.nik || null,
      nama: userData.nama,
      role: userData.role,
      alamat: userData.alamat || null,
      no_hp: userData.no_hp || null, 
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      laporan: userData.laporan || []
    };

    console.log('=== SENDING RESPONSE ===');
    console.log(JSON.stringify(response, null, 2));
    console.log('========================');
    
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
