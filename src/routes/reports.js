const express = require('express');
const { productStock, summary } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/product-stock', protect, adminOnly, productStock);
router.get('/summary', protect, adminOnly, summary);

module.exports = router;
