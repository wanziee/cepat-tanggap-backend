'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tambahkan kolom kd_laporan
    await queryInterface.addColumn('laporan', 'kd_laporan', {
      type: Sequelize.STRING,
      allowNull: true, // sementara
    });

    // 2. Tambahkan kolom is_anonymous
    await queryInterface.addColumn('laporan', 'is_anonymous', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // 3. Isi nilai kd_laporan untuk data yang sudah ada
    const [laporan] = await queryInterface.sequelize.query('SELECT id FROM laporan');
    for (const row of laporan) {
      const kode = `LAP${String(row.id).padStart(6, '0')}`;
      await queryInterface.sequelize.query(`
        UPDATE laporan SET kd_laporan = '${kode}' WHERE id = ${row.id}
      `);
    }

    // 4. Baru ubah jadi tidak boleh null
    await queryInterface.changeColumn('laporan', 'kd_laporan', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('laporan', 'kd_laporan');
    await queryInterface.removeColumn('laporan', 'is_anonymous');
  }
};
