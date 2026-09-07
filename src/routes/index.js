const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/categories', require('./categories'));
router.use('/products', require('./products'));
router.use('/cart', require('./cart'));
router.use('/orders', require('./orders'));
router.use('/addresses', require('./addresses'));
router.use('/settings', require('./settings'));
router.use('/upload', require('./upload'));
router.use('/banners', require('./banners'));

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'pantry-server' }));

module.exports = router;
