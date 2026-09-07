const express = require('express');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', listProducts);
router.get('/:slug', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
