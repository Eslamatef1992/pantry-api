const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Brand = sequelize.define('Brand', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nameEn: { type: DataTypes.STRING, allowNull: false },
  nameAr: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  image: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Brand;
