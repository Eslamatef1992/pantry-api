const express = require('express');
const {
  createOrder,
  createGuestOrder,
  myOrders,
  getMyOrder,
  listAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Guest checkout - no account required
router.post('/guest', createGuestOrder);

router.use(protect);
router.post('/', createOrder);
router.get('/', myOrders);
router.get('/:id', getMyOrder);

// Admin
router.get('/admin/all', adminOnly, listAllOrders);
router.get('/admin/:id', adminOnly, getOrderByIdAdmin);
router.put('/admin/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
