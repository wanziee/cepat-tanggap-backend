const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Laporan extends Model {
    static associate(models) {
      Laporan.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Laporan.hasMany(models.LogStatus, { foreignKey: 'laporan_id', as: 'logStatus' });
    }

    // Method untuk mendapatkan display text dari kategori
    getKategoriDisplay() {
      return this.kategori;
    }
  }

  Laporan.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    kategori: {
      type: DataTypes.ENUM(
        'Fasilitas Umum',
        'Jalan & Transportasi',
        'Sampah & Kebersihan',
        'Air & Drainase',
        'Keamanan',
        'Kesehatan',
        'Listrik & PJU',
        'Bangunan Liar',
        'Lingkungan Sosial',
        'Lainnya'
      ),
      allowNull: false
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    foto: {
      type: DataTypes.TEXT
    },
    lokasi: {
      type: DataTypes.STRING(255)
    },
    status: {
      type: DataTypes.ENUM('pending', 'diproses', 'selesai'),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Laporan',
    tableName: 'laporan',
    timestamps: true,
    underscored: true,
    defaultScope: {
      attributes: {
        exclude: ['password']
      }
    }
  });

  return Laporan;
};
