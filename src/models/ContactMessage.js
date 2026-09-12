const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Brand-new table -- created automatically by sequelize.sync() on next API
// restart, no manual ALTER TABLE needed (unlike columns added to existing tables).
const ContactMessage = sequelize.define('ContactMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = ContactMessage;
