'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Ambil user dengan role admin untuk dijadikan pembuat data
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    );
    
    if (users.length === 0) {
      console.warn('Tidak ada user admin yang ditemukan. Data rekap kas tidak dapat dibuat.');
      return;
    }
    
    const adminId = users[0].id;
    
    // Data rekap kas dummy
    const rekapKasData = [
      {
        tanggal: new Date('2025-06-01'),
        keterangan: 'Iuran Warga Bulan Juni',
        jenis: 'pemasukan',
        jumlah: 500000,
        saldo: 500000,
        rt: '001',
        rw: '001',
        user_id: adminId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tanggal: new Date('2025-06-05'),
        keterangan: 'Pembelian peralatan kebersihan',
        jenis: 'pengeluaran',
        jumlah: 250000,
        saldo: 250000,
        rt: '001',
        rw: '001',
        user_id: adminId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tanggal: new Date('2025-06-10'),
        keterangan: 'Iuran Warga Bulan Juni',
        jenis: 'pemasukan',
        jumlah: 300000,
        saldo: 550000,
        rt: '002',
        rw: '001',
        user_id: adminId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tanggal: new Date('2025-06-15'),
        keterangan: 'Perbaikan jalan lingkungan',
        jenis: 'pengeluaran',
        jumlah: 1000000,
        saldo: -450000,
        rt: '002',
        rw: '001',
        user_id: adminId,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // Masukkan data ke tabel rekap_kas
    await queryInterface.bulkInsert('rekap_kas', rekapKasData, {});
  },

  async down (queryInterface, Sequelize) {
    // Hapus semua data dari tabel rekap_kas
    await queryInterface.bulkDelete('rekap_kas', null, {});
  }
};
