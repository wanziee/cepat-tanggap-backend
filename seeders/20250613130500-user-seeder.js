'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    const users = [
      // Admin
      {
        nik: '0000000000000000',
        nama: 'Administrator',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        alamat: 'Kantor Desa',
        no_hp: '081234567890',
        created_at: now,
        updated_at: now
      },
      // Sample RW (Rukun Warga)
      {
        nik: '0100000000000000',
        nama: 'Ketua RW 1',
        password: bcrypt.hashSync('rw123456', 10),
        role: 'rw',
        alamat: 'Kantor RW 1',
        no_hp: '081200000001',
        created_at: now,
        updated_at: now
      },
      // Sample RT (Rukun Tetangga)
      {
        nik: '0201000000000000',
        nama: 'Ketua RT 1 RW 1',
        password: bcrypt.hashSync('rt123456', 10),
        role: 'rt',
        alamat: 'Kantor RT 1 RW 1',
        no_hp: '081200000002',
        created_at: now,
        updated_at: now
      },
      // Sample Warga
      {
        nik: '0301000000000001',
        nama: 'Warga Contoh',
        password: bcrypt.hashSync('warga123', 10),
        role: 'warga',
        alamat: 'Jl. Contoh No. 1',
        no_hp: '081200000003',
        created_at: now,
        updated_at: now
      },
      // Warga tambahan: Iwan
      {
        nik: '0301000000000002',
        nama: 'Iwan',
        password: bcrypt.hashSync('iwan123', 10),
        role: 'warga',
        alamat: 'Jl. Melati No. 5',
        no_hp: '08120000000555',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, { truncate: true, cascade: true, restartIdentity: true });
  }
};
