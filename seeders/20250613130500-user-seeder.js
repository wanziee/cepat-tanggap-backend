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
        rt: '001',
        rw: '001',
        created_at: now,
        updated_at: now
      },
      // Sample RW 1
      {
        nik: '0100000000000001',
        nama: 'Ketua RW 1',
        email: 'rw1@example.com',
        password: bcrypt.hashSync('rw123456', 10),
        role: 'rw',
        alamat: 'Kantor RW 1',
        no_hp: '081200000001',
        rt: '001',
        rw: '001',
        created_at: now,
        updated_at: now
      },
      // Sample RT 1 RW 1
      {
        nik: '0201000000000001',
        nama: 'Ketua RT 1 RW 1',
        email: 'rt1rw1@example.com',
        password: bcrypt.hashSync('rt123456', 10),
        role: 'rt',
        alamat: 'Kantor RT 1 RW 1',
        no_hp: '081200000002',
        rt: '001',
        rw: '001',
        created_at: now,
        updated_at: now
      },
      // Sample RT 2 RW 1
      {
        nik: '0201000000000002',
        nama: 'Ketua RT 2 RW 1',
        email: 'rt2rw1@example.com',
        password: bcrypt.hashSync('rt123456', 10),
        role: 'rt',
        alamat: 'Kantor RT 2 RW 1',
        no_hp: '081200000003',
        rt: '002',
        rw: '001',
        created_at: now,
        updated_at: now
      },
      // Sample RW 2
      {
        nik: '0100000000000002',
        nama: 'Ketua RW 2',
        email: 'rw2@example.com',
        password: bcrypt.hashSync('rw123456', 10),
        role: 'rw',
        alamat: 'Kantor RW 2',
        no_hp: '081200000011',
        rt: '001',
        rw: '002',
        created_at: now,
        updated_at: now
      },
      // Sample RT 1 RW 2
      {
        nik: '0202000000000001',
        nama: 'Ketua RT 1 RW 2',
        email: 'rt1rw2@example.com',
        password: bcrypt.hashSync('rt123456', 10),
        role: 'rt',
        alamat: 'Kantor RT 1 RW 2',
        no_hp: '081200000012',
        rt: '001',
        rw: '002',
        created_at: now,
        updated_at: now
      },
      // Warga Contoh RW 1 RT 1
      {
        nik: '0301000000000001',
        nama: 'Warga RW 1 RT 1',
        email: 'warga1@example.com',
        password: bcrypt.hashSync('warga123', 10),
        role: 'warga',
        alamat: 'Jl. Contoh No. 1',
        no_hp: '081200000101',
        rt: '001',
        rw: '001',
        created_at: now,
        updated_at: now
      },
      // Warga Contoh RW 1 RT 2
      {
        nik: '0301000000000002',
        nama: 'Warga RW 1 RT 2',
        email: 'warga2@example.com',
        password: bcrypt.hashSync('warga123', 10),
        role: 'warga',
        alamat: 'Jl. Contoh No. 2',
        no_hp: '081200000102',
        rt: '002',
        rw: '001',
        created_at: now,
        updated_at: now
      },
      // Warga Contoh RW 2 RT 1
      {
        nik: '0302000000000001',
        nama: 'Warga RW 2 RT 1',
        email: 'warga3@example.com',
        password: bcrypt.hashSync('warga123', 10),
        role: 'warga',
        alamat: 'Jl. Contoh No. 3',
        no_hp: '081200000201',
        rt: '001',
        rw: '002',
        created_at: now,
        updated_at: now
      },
      // Iwan (Admin)
      {
        nik: '1234567890123456',
        nama: 'Mohammad Ichwan Al Ghifari',
        email: 'ichwanalghifa@gmail.com',
        password: bcrypt.hashSync('iwan123', 10),
        role: 'admin',
        alamat: 'Jl. Anggrek Cendrawasih No. 5',
        no_hp: '085719655321',
        rt: '001',
        rw: '001',
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
