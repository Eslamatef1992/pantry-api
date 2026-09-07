const express = require('express');
const {
  listPublicPaymentMethods,
  listPaymentSettings,
  updatePaymentSetting,
} = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/payment-methods', listPublicPaymentMethods);
router.get('/admin/payment-methods', protect, adminOnly, listPaymentSettings);
router.put('/admin/payment-methods/:method', protect, adminOnly, updatePaymentSetting);

module.exports = router;
