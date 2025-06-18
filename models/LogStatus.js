const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LogStatus extends Model {
    static associate(models) {
      LogStatus.belongsTo(models.Laporan, { foreignKey: 'laporan_id', as: 'laporan' });
      LogStatus.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  LogStatus.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    laporan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'laporan',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'diproses', 'selesai'),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    waktu: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'LogStatus',
    tableName: 'log_status',
    timestamps: true,
    underscored: true
  });

  return LogStatus;
};
