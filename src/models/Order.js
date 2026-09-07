const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  addressId: { type: DataTypes.INTEGER, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  paymentMethod: { type: DataTypes.ENUM('knet', 'sadad', 'cod'), allowNull: false },
  paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  subtotal: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  deliveryFee: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  shippingSnapshot: { type: DataTypes.JSON, allowNull: true },
  notes: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Order;
