const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Single-row-per-method table so the admin panel can toggle KNET / Sadad / COD
// on and off without a code deploy.
const PaymentSetting = sequelize.define('PaymentSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  method: { type: DataTypes.ENUM('knet', 'sadad', 'cod'), allowNull: false, unique: true },
  isEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  displayNameEn: { type: DataTypes.STRING, allowNull: true },
  displayNameAr: { type: DataTypes.STRING, allowNull: true },
  config: { type: DataTypes.JSON, allowNull: true }, // merchant id / api key references, no secrets in plain text ideally
});

module.exports = PaymentSetting;
