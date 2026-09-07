const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  nameEn: { type: DataTypes.STRING, allowNull: false },
  nameAr: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = OrderItem;
