const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nameEn: { type: DataTypes.STRING, allowNull: false },
  nameAr: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  descriptionEn: { type: DataTypes.TEXT, allowNull: true },
  descriptionAr: { type: DataTypes.TEXT, allowNull: true },
  sku: { type: DataTypes.STRING, allowNull: true, unique: true },
  price: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  compareAtPrice: { type: DataTypes.DECIMAL(10, 3), allowNull: true },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  unit: { type: DataTypes.STRING, defaultValue: 'pc' },
  image: { type: DataTypes.STRING, allowNull: true },
  images: { type: DataTypes.JSON, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  isBestSeller: { type: DataTypes.BOOLEAN, defaultValue: false },
  isNewArrival: { type: DataTypes.BOOLEAN, defaultValue: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Product;
