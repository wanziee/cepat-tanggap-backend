const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Laporan, { foreignKey: "user_id", as: "laporan" });
      User.hasMany(models.LogStatus, {
        foreignKey: "user_id",
        as: "logStatus",
      });
      User.hasMany(models.RekapKas, {
        foreignKey: 'user_id',
        as: 'rekapKas'
      });
    }

    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nik: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("warga", "rt", "rw", "admin"),
        allowNull: false,
        defaultValue: "warga",
      },
      alamat: {
        type: DataTypes.TEXT,
      },
      no_hp: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "no_hp",
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true, // atau false kalau wajib
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      rt: {
        type: DataTypes.STRING(3),
        allowNull: true,
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
        allowNull: true,
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
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: ["password"],
        },
      },
      hooks: {
        beforeCreate: async (user) => {
          // Validasi RT dan RW jika diisi
          if (user.rt && !/^\d{1,3}$/.test(user.rt)) {
            throw new Error('RT harus berupa angka 1-3 digit');
          }
          
          if (user.rw && !/^\d{1,3}$/.test(user.rw)) {
            throw new Error('RW harus berupa angka 1-3 digit');
          }
          
          // Hash password
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          // Validasi RT dan RW jika diupdate
          if (user.changed('rt') && user.rt && !/^\d{1,3}$/.test(user.rt)) {
            throw new Error('RT harus berupa angka 1-3 digit');
          }
          
          if (user.changed('rw') && user.rw && !/^\d{1,3}$/.test(user.rw)) {
            throw new Error('RW harus berupa angka 1-3 digit');
          }
          
          // Hash password jika diupdate
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};
