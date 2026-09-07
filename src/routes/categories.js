const express = require('express');
const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', listCategories);
router.get('/:slug', getCategory);
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
