'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rekap_kas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tanggal: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      keterangan: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      jenis: {
        type: Sequelize.ENUM('pemasukan', 'pengeluaran'),
        allowNull: false
      },
      jumlah: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      saldo: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      rt: {
        type: Sequelize.STRING(3),
        allowNull: false,
        comment: 'Nomor RT'
      },
      rw: {
        type: Sequelize.STRING(3),
        allowNull: false,
        comment: 'Nomor RW'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rekap_kas');
  }
};
