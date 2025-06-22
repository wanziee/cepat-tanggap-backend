'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const users = [
      // Admin
      {
        nik: '0000000000000000',
        nama: 'Administrator',
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        alamat: 'Kantor Desa',
        no_hp: '081234567890',
        created_at: now,
        updated_at: now
      },
      // Sample RW
      {
        nik: '0100000000000000',
        nama: 'Ketua RW 1',
        email: 'rw1@example.com',
        password: bcrypt.hashSync('rw123456', 10),
        role: 'rw',
        alamat: 'Kantor RW 1',
        no_hp: '081200000001',
        created_at: now,
        updated_at: now
      },
      // Sample RT
      {
        nik: '0201000000000000',
        nama: 'Ketua RT 1 RW 1',
        email: 'rt1rw1@example.com',
        password: bcrypt.hashSync('rt123456', 10),
        role: 'rt',
        alamat: 'Kantor RT 1 RW 1',
        no_hp: '081200000002',
        created_at: now,
        updated_at: now
      },
      // Warga Contoh
      {
        nik: '0301000000000001',
        nama: 'Warga Contoh',
        email: 'warga1@example.com',
        password: bcrypt.hashSync('warga123', 10),
        role: 'warga',
        alamat: 'Jl. Contoh No. 1',
        no_hp: '081200000003',
        created_at: now,
        updated_at: now
      },
      // Iwan
      {
        nik: '1234567890123456',
        nama: 'Mohammad Ichwan Al Ghifari',
        email: 'ichwanalghifa@gmail.com',
        password: bcrypt.hashSync('iwan123', 10),
        role: 'warga',
        alamat: 'Jl. Anggrek Cendrawasih No. 5',
        no_hp: '085719655321',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {
      truncate: true,
      cascade: true,
      restartIdentity: true
    });
  }
};
