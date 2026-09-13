const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Singleton row (id always 1) holding site-wide SEO meta tags shown on the
// storefront (falls back to per-page values where the storefront sets its own).
const SeoSetting = sequelize.define('SeoSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  metaTitleEn: { type: DataTypes.STRING, allowNull: true },
  metaTitleAr: { type: DataTypes.STRING, allowNull: true },
  metaDescriptionEn: { type: DataTypes.TEXT, allowNull: true },
  metaDescriptionAr: { type: DataTypes.TEXT, allowNull: true },
  metaKeywords: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = SeoSetting;
