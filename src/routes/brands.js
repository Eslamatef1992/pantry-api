const express = require('express');
const {
  listBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', listBrands);
router.get('/:slug', getBrand);
router.post('/', protect, adminOnly, createBrand);
router.put('/:id', protect, adminOnly, updateBrand);
router.delete('/:id', protect, adminOnly, deleteBrand);

module.exports = router;
