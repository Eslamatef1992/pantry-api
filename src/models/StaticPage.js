const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StaticPage = sequelize.define('StaticPage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  titleEn: { type: DataTypes.STRING, allowNull: false },
  titleAr: { type: DataTypes.STRING, allowNull: false },
  contentEn: { type: DataTypes.TEXT, allowNull: true },
  contentAr: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = StaticPage;
