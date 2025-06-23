const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RekapKas extends Model {
    static associate(models) {
      // Relasi ke User
      RekapKas.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  RekapKas.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    jenis: {
      type: DataTypes.ENUM('pemasukan', 'pengeluaran'),
      allowNull: false
    },
    jumlah: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    saldo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    rt: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: 'Nomor RT',
      validate: {
        is: {
          args: /^\d{1,3}$/,
          msg: 'RT harus berupa angka 1-3 digit'
        },
        len: {
          args: [1, 3],
          msg: 'RT harus 1-3 digit'
        }
      }
    },
    rw: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: 'Nomor RW',
      validate: {
        is: {
          args: /^\d{1,3}$/,
          msg: 'RW harus berupa angka 1-3 digit'
        },
        len: {
          args: [1, 3],
          msg: 'RW harus 1-3 digit'
        }
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'RekapKas',
    tableName: 'rekap_kas',
    timestamps: true,
    underscored: true
  });

  return RekapKas;
};
