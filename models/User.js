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
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};
