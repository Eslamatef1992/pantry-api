const express = require('express');
const {
  listCustomers,
  setCustomerActive,
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require('../controllers/userController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');

const router = express.Router();

// Users module (#37): any admin can view registered customers.
router.get('/customers', protect, adminOnly, listCustomers);
router.put('/customers/:id/active', protect, adminOnly, setCustomerActive);

// Admins module (#38): restricted to super_admin.
router.get('/admins', protect, superAdminOnly, listAdmins);
router.post('/admins', protect, superAdminOnly, createAdmin);
router.put('/admins/:id', protect, superAdminOnly, updateAdmin);
router.delete('/admins/:id', protect, superAdminOnly, deleteAdmin);

module.exports = router;
