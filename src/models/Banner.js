const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titleEn: { type: DataTypes.STRING, allowNull: true },
  titleAr: { type: DataTypes.STRING, allowNull: true },
  subtitleEn: { type: DataTypes.STRING, allowNull: true },
  subtitleAr: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: false },
  linkUrl: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Banner;
