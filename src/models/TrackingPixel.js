const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Marketing / analytics pixels and scripts the super admin wires up from the
// admin panel (SEO module). Active rows are injected directly into the
// storefront by the client on load -- see server/src/controllers/seoController.js
// (getPublicSeo) and client/src/components/SeoInjector.jsx.
const TrackingPixel = sequelize.define('TrackingPixel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: {
    type: DataTypes.ENUM('gtm', 'ga4', 'snap_pixel', 'facebook_pixel', 'tiktok_pixel', 'custom'),
    allowNull: false,
  },
  label: { type: DataTypes.STRING, allowNull: false },
  // pixelId: the short container/pixel ID for the known types (GTM-XXXX, G-XXXX, etc).
  pixelId: { type: DataTypes.STRING, allowNull: true },
  // code: raw HTML/JS snippet, used only for type = 'custom'.
  code: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = TrackingPixel;
