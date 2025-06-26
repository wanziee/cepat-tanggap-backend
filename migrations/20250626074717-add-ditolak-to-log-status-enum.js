'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ENUM type name biasanya: enum_<tableName>_<columnName>
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_log_status_status" ADD VALUE IF NOT EXISTS 'ditolak';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // PostgreSQL doesn't support removing a value from ENUM directly
    // You can recreate the enum manually if needed, but for now we leave it empty
  }
};
