const express = require('express');
const {
  listPublicPaymentMethods,
  listPaymentSettings,
  updatePaymentSetting,
  getSiteSettings,
  updateSiteSettings,
  updateOrderRules,
} = require('../controllers/settingsController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/payment-methods', listPublicPaymentMethods);
router.get('/site', getSiteSettings);
router.get('/admin/payment-methods', protect, adminOnly, listPaymentSettings);
router.put('/admin/payment-methods/:method', protect, adminOnly, updatePaymentSetting);
router.put('/admin/site', protect, adminOnly, updateSiteSettings);
router.put('/admin/rules', protect, superAdminOnly, updateOrderRules);

module.exports = router;
