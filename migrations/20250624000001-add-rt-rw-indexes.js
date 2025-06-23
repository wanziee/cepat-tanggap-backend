'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambahkan index untuk RT dan RW di tabel users
    await queryInterface.addIndex('users', ['rt'], {
      name: 'idx_users_rt'
    });
    
    await queryInterface.addIndex('users', ['rw'], {
      name: 'idx_users_rw'
    });
    
    await queryInterface.addIndex('users', ['rt', 'rw'], {
      name: 'idx_users_rt_rw'
    });
    
    // Tambahkan index untuk RT dan RW di tabel rekap_kas
    await queryInterface.addIndex('rekap_kas', ['rt'], {
      name: 'idx_rekap_kas_rt'
    });
    
    await queryInterface.addIndex('rekap_kas', ['rw'], {
      name: 'idx_rekap_kas_rw'
    });
    
    await queryInterface.addIndex('rekap_kas', ['rt', 'rw'], {
      name: 'idx_rekap_kas_rt_rw'
    });
    
    // Tambahkan index untuk tanggal di rekap_kas
    await queryInterface.addIndex('rekap_kas', ['tanggal'], {
      name: 'idx_rekap_kas_tanggal'
    });
  },

  async down(queryInterface, Sequelize) {
    // Hapus semua index yang telah dibuat
    await queryInterface.removeIndex('users', 'idx_users_rt');
    await queryInterface.removeIndex('users', 'idx_users_rw');
    await queryInterface.removeIndex('users', 'idx_users_rt_rw');
    
    await queryInterface.removeIndex('rekap_kas', 'idx_rekap_kas_rt');
    await queryInterface.removeIndex('rekap_kas', 'idx_rekap_kas_rw');
    await queryInterface.removeIndex('rekap_kas', 'idx_rekap_kas_rt_rw');
    await queryInterface.removeIndex('rekap_kas', 'idx_rekap_kas_tanggal');
  }
};
