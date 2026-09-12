const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Wishlist = sequelize.define(
  'Wishlist',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    indexes: [{ unique: true, fields: ['user_id', 'product_id'] }],
  }
);

module.exports = Wishlist;
