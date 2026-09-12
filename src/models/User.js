const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'admin'), defaultValue: 'customer' },
  // Only meaningful when role='admin'. super_admin can manage other admins and
  // store-wide Rules; staff has access to day-to-day modules only.
  adminRole: { type: DataTypes.ENUM('super_admin', 'staff'), allowNull: true, defaultValue: null },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = User;
