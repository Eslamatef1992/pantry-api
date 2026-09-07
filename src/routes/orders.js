const express = require('express');
const {
  createOrder,
  myOrders,
  getMyOrder,
  listAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', createOrder);
router.get('/', myOrders);
router.get('/:id', getMyOrder);

// Admin
router.get('/admin/all', adminOnly, listAllOrders);
router.put('/admin/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
