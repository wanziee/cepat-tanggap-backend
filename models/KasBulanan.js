'use strict';


module.exports = (sequelize, DataTypes) => {
  const KasBulanan = sequelize.define('KasBulanan', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filepath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    filesize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    uploaded_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    related_rt: {
      type: DataTypes.STRING(10)
    },
    related_rw: {
      type: DataTypes.STRING(10)
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'kas_bulanan',
    underscored: true
  });

  KasBulanan.associate = function(models) {
    // Relasi: KasBulanan di-upload oleh satu User
    KasBulanan.belongsTo(models.User, {
      foreignKey: 'uploaded_by_user_id',
      as: 'uploader'
    });
  };

  return KasBulanan;
};
