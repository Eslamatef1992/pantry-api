const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  label: { type: DataTypes.STRING, allowNull: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  governorate: { type: DataTypes.STRING, allowNull: true },
  area: { type: DataTypes.STRING, allowNull: true },
  block: { type: DataTypes.STRING, allowNull: true },
  street: { type: DataTypes.STRING, allowNull: true },
  building: { type: DataTypes.STRING, allowNull: true },
  floorApartment: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.STRING, allowNull: true },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Address;
