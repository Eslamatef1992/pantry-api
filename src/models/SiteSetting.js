const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Singleton row (id always 1) holding storefront contact info shown in the footer.
const SiteSetting = sequelize.define('SiteSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone1: { type: DataTypes.STRING, allowNull: true },
  phone2: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
});

module.exports = SiteSetting;
